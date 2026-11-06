import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <main class="login-page">
    <form class="login-card" [formGroup]="form" (ngSubmit)="entrar()">
      <div class="logo">P</div>
      <h1>PharmaSoft</h1>
      <p class="subtitulo">Inicia sesión para continuar</p>
      @if (expirada) { <div class="aviso" role="status">Su sesión expiró. Inicie sesión nuevamente.</div> }
      @if (error()) { <div class="error" role="alert">{{ error() }}</div> }
      <label for="username">Usuario</label>
      <input id="username" class="input" formControlName="username" autocomplete="username" placeholder="Tu usuario">
      @if (form.controls.username.touched && form.controls.username.invalid) { <small>Ingresa tu usuario.</small> }
      <label for="password">Contraseña</label>
      <input id="password" class="input" type="password" formControlName="password" autocomplete="current-password" placeholder="Tu contraseña">
      @if (form.controls.password.touched && form.controls.password.invalid) { <small>Ingresa tu contraseña.</small> }
      <button class="btn btn-primary" type="submit" [disabled]="form.invalid || cargando()">
        {{ cargando() ? 'Validando…' : 'Iniciar sesión' }}
      </button>
      <p class="pie">Acceso protegido · JWT</p>
    </form>
  </main>`,
  styles: [`
  :host{display:block;min-height:100vh}.login-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,#102d50,#245b86)}
  .login-card{width:min(100%,420px);padding:36px;background:white;border-radius:20px;box-shadow:0 24px 70px #061b3266;display:flex;flex-direction:column;gap:12px}
  .logo{width:52px;height:52px;border-radius:15px;background:#173b67;color:#f2b544;display:grid;place-items:center;font-size:30px;font-weight:800}
  h1{margin:4px 0 0;color:#173b67}.subtitulo,.pie{margin:0;color:#64748b}.login-card label{font-weight:600;margin-top:8px}.login-card .btn{width:100%;margin-top:12px}.error{padding:12px;border-radius:8px;background:#fff1f0;color:#a5221a}.aviso{padding:10px;background:#fff6dc;color:#7a5200;border-radius:8px}.login-card small{color:#b42318}
  `],
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly expirada = this.route.snapshot.queryParamMap.get('expirada') === '1';
  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  entrar(): void {
    if (this.form.invalid || this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/inicio';
        const destino = returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/inicio';
        void this.router.navigateByUrl(destino);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 401 ? 'Usuario o contraseña incorrectos.'
          : err.status === 0 ? 'No se pudo conectar con el servidor. Verifica que el backend esté activo.'
          : 'No se pudo iniciar sesión. Revisa la API y vuelve a intentar.');
        this.cargando.set(false);
      },
    });
  }
}
