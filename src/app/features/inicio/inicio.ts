import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { MasVendidos } from './mas-vendidos';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MasVendidos],
  templateUrl: './inicio.html',
})
export class Inicio { protected readonly auth = inject(AuthService); }
