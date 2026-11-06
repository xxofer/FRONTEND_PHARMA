import { Routes } from '@angular/router';
import { VentaList } from './pages/venta-list/venta-list';
import { VentaForm } from './pages/venta-form/venta-form';
import { VentaDetalle } from './pages/venta-detalle/venta-detalle';
import { VentaReporteCategorias } from './pages/venta-reporte-categorias/venta-reporte-categorias';
import { permisoGuard } from '../../core/auth/permiso.guard';
export const VENTAS_ROUTES: Routes = [
 { path: '', component: VentaList, title: 'Consulta de ventas' },
 { path: 'nueva', component: VentaForm, title: 'Nueva venta', canActivate: [permisoGuard], data: { permiso: 'VENTAS_REGISTRAR' } },
 { path: 'reporte-categorias', component: VentaReporteCategorias, title: 'Reporte de ventas por categoría', canActivate: [permisoGuard], data: { permiso: 'REPORTES_VER' } },
 { path: ':id', component: VentaDetalle, title: 'Comprobante de venta' },
];
