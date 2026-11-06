import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Permiso, Sesion } from './auth.models';

const CLAVE_SESION = 'pharmasoft.sesion';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly actual = signal<Sesion | null>(this.leerSesionGuardada());
  private temporizador?: ReturnType<typeof setTimeout>;
  readonly sesion = this.actual.asReadonly();
  readonly autenticado = computed(() => { const s = this.actual(); return !!s && Date.now() < s.expiraEn; });
  readonly tokenActual = computed(() => this.autenticado() ? this.actual()!.token : null);
  readonly username = computed(() => this.actual()?.username ?? null);
  readonly roles = computed(() => this.actual()?.roles ?? []);
  constructor() { const s = this.actual(); if (s) this.programarExpiracion(s); }

  login(dto: LoginRequest): Observable<Sesion> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, dto).pipe(
      map(r => {
        if (!r.token) throw new Error('El servidor no devolvió un token JWT.');
        return { token: r.token, expiraEn: Date.now() + r.expiraEnSegundos * 1000,
          username: r.username, nombreCompleto: r.nombreCompleto, roles: r.roles ?? [], permisos: r.permisos ?? [] };
      }), tap(s => this.iniciar(s)));
  }
  cerrarSesion(motivo?: 'expirada', volverA?: string): void {
    clearTimeout(this.temporizador);
    try { sessionStorage.removeItem(CLAVE_SESION); } catch { /* almacenamiento no disponible */ }
    this.actual.set(null);
    const queryParams: Record<string, string> = {};
    if (motivo) queryParams['expirada'] = '1';
    if (volverA && volverA !== '/login') queryParams['returnUrl'] = volverA;
    void this.router.navigate(['/login'], { queryParams });
  }
  tienePermiso(permiso: Permiso): boolean { return this.actual()?.permisos.includes(permiso) ?? false; }
  private iniciar(s: Sesion): void {
    try { sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s)); } catch { /* se mantiene en memoria */ }
    this.actual.set(s); this.programarExpiracion(s);
  }
  private programarExpiracion(s: Sesion): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.cerrarSesion('expirada', this.router.url), Math.max(0, s.expiraEn - Date.now()));
  }
  private leerSesionGuardada(): Sesion | null {
    try {
      const raw = sessionStorage.getItem(CLAVE_SESION); if (!raw) return null;
      const s = JSON.parse(raw) as Sesion;
      if (!s.token || !s.expiraEn || Date.now() >= s.expiraEn || !Array.isArray(s.permisos)) { sessionStorage.removeItem(CLAVE_SESION); return null; }
      return s;
    } catch { try { sessionStorage.removeItem(CLAVE_SESION); } catch {} return null; }
  }
}
