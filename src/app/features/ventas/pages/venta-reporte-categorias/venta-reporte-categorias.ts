import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { EMPTY, expand, map, reduce, forkJoin } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { Producto } from '../../../productos/models/producto.model';
import { ProductoService } from '../../../productos/services/producto-service';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

interface ResumenCategoria {
  categoria: string;
  unidades: number;
  importe: number;
  operaciones: number;
}

@Component({
  selector: 'app-venta-reporte-categorias',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './venta-reporte-categorias.html',
  styleUrl: './venta-reporte-categorias.css',
})
export class VentaReporteCategorias implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly productoService = inject(ProductoService);
  protected readonly resumen = signal<ResumenCategoria[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly totalGeneral = signal(0);
  protected readonly totalUnidades = signal(0);

  ngOnInit(): void {
    const filtro = { clienteId: null, estado: null, desde: null, hasta: null };
    const ventas$ = this.ventaService.buscar(filtro, 0, 100).pipe(
      expand(p => p.ultima ? EMPTY : this.ventaService.buscar(filtro, p.pagina + 1, 100)),
      map(p => p.contenido),
      reduce((acumuladas, pagina) => acumuladas.concat(pagina), [] as Venta[]),
    );
    const productos$ = this.productoService.listar(0, 100, 'nombre', 'asc').pipe(map(p => p.contenido));
    forkJoin({ ventas: ventas$, productos: productos$ }).subscribe({
      next: ({ ventas, productos }) => {
        this.calcular(ventas, productos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  private calcular(ventas: Venta[], productos: Producto[]): void {
    const productoPorId = new Map(productos.map(p => [p.id, p]));
    const acumulado = new Map<string, { unidades: number; importe: number; operaciones: Set<number> }>();
    for (const venta of ventas.filter(v => v.estado === 'REGISTRADA')) {
      for (const detalle of venta.detalles ?? []) {
        const categoria = productoPorId.get(detalle.productoId)?.categoriaNombre || 'Categoría no disponible';
        const actual = acumulado.get(categoria) ?? { unidades: 0, importe: 0, operaciones: new Set<number>() };
        actual.unidades += detalle.cantidad;
        actual.importe += detalle.subtotal;
        actual.operaciones.add(venta.id);
        acumulado.set(categoria, actual);
      }
    }
    const filas = [...acumulado.entries()]
      .map(([categoria, valor]) => ({
        categoria,
        unidades: valor.unidades,
        importe: Math.round((valor.importe + Number.EPSILON) * 100) / 100,
        operaciones: valor.operaciones.size,
      }))
      .sort((a, b) => b.importe - a.importe);
    this.resumen.set(filas);
    this.totalGeneral.set(Math.round(filas.reduce((s, f) => s + f.importe, 0) * 100) / 100);
    this.totalUnidades.set(filas.reduce((s, f) => s + f.unidades, 0));
  }

  imprimir(): void { window.print(); }
}
