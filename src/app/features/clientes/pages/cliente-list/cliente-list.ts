import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { ClienteService } from '../../services/cliente-service';
import { Cliente } from '../../models/cliente.model';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-cliente-list',
  imports: [RouterLink, SiPermiso],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private readonly clienteService = inject(ClienteService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');
  protected readonly ordenarPor = signal<'dni' | 'apellidos'>('apellidos');
  protected readonly direccion = signal<'asc' | 'desc'>('asc');

  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();

    const resultado = !texto
      ? [...this.clientes()]
      : this.clientes().filter((cliente) =>
          cliente.dni.toLowerCase().includes(texto) ||
          cliente.nombres.toLowerCase().includes(texto) ||
          cliente.apellidos.toLowerCase().includes(texto) ||
          cliente.email.toLowerCase().includes(texto)
        );

    const campo = this.ordenarPor();
    const direccion = this.direccion() === 'asc' ? 1 : -1;

    return resultado.sort((a, b) => {
      const valorA = campo === 'dni' ? a.dni : a.apellidos;
      const valorB = campo === 'dni' ? b.dni : b.apellidos;
      return valorA.localeCompare(valorB, 'es', { sensitivity: 'base' }) * direccion;
    });
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clienteService.listar().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  ordenar(campo: 'dni' | 'apellidos'): void {
    if (this.ordenarPor() === campo) {
      this.direccion.set(this.direccion() === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }
  }

  eliminar(cliente: Cliente): void {
    if (!confirm(`¿Dar de baja al cliente "${cliente.nombres} ${cliente.apellidos}"?`)) {
      return;
    }

    this.clienteService.eliminar(cliente.id).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}
