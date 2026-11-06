import { Routes } from '@angular/router';
import { ProductoList } from './pages/producto-list/producto-list';
import { ProductoForm } from './pages/producto-form/producto-form';
import { permisoGuard } from '../../core/auth/permiso.guard';
export const PRODUCTOS_ROUTES: Routes = [
 { path: '', component: ProductoList, title: 'Productos' },
 { path: 'nuevo', component: ProductoForm, title: 'Nuevo producto', canActivate: [permisoGuard], data: { permiso: 'CATALOGO_ESCRIBIR' } },
 { path: ':id/editar', component: ProductoForm, title: 'Editar producto', canActivate: [permisoGuard], data: { permiso: 'CATALOGO_ESCRIBIR' } },
];
