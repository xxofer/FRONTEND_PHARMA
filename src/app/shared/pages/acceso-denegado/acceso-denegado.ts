import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-acceso-denegado', standalone: true, imports: [RouterLink], template: `
<section style="max-width:640px;margin:48px auto;padding:28px;border:1px solid #e2e8f0;border-radius:16px;background:#fff">
<h2>403 · Acceso denegado</h2><p>Tu usuario no tiene permiso para abrir esta página. Si necesitas acceso, solicítalo al administrador.</p>
<a routerLink="/inicio">Volver al inicio</a></section>` })
export class AccesoDenegado {}
