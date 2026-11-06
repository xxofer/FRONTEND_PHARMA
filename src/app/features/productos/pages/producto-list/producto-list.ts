import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto-service';
import { Producto } from '../../models/producto.model';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
@Component({selector:'app-producto-list',standalone:true,imports:[CurrencyPipe,RouterLink,SiPermiso],template:`
<section class="panel"><div class="titulo"><div><h1>Productos</h1><p>Catálogo de productos de PharmaSoft</p></div><a *appSiPermiso="'CATALOGO_ESCRIBIR'" routerLink="nuevo" class="btn">+ Nuevo producto</a></div>
@if(error()){<p role="alert" class="error">{{error()}}</p>} @if(cargando()){<p>Cargando productos...</p>} @else {
<div class="tabla"><table><thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th><th *appSiPermiso="'CATALOGO_ESCRIBIR'">Acciones</th></tr></thead><tbody>
@for(p of productos();track p.id){<tr><td>{{p.nombre}}</td><td>{{p.precio | currency:'PEN':'S/ '}}</td><td>{{p.stock}}</td><td>{{p.estado?'Activo':'Inactivo'}}</td><td *appSiPermiso="'CATALOGO_ESCRIBIR'"><a [routerLink]="[p.id,'editar']">Editar</a></td></tr>} @empty {<tr><td colspan="5">No hay productos registrados.</td></tr>}
</tbody></table></div>}</section>`,styles:[`.panel{background:white;padding:24px;border-radius:16px}.titulo{display:flex;align-items:center;justify-content:space-between;gap:12px}h1{margin:0}.titulo p{color:#64748b}.btn{background:#173b67;color:white;padding:10px 14px;border-radius:8px;text-decoration:none}.tabla{overflow:auto}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{text-align:left;padding:12px;border-bottom:1px solid #e2e8f0}.error{color:#b42318}`]})
export class ProductoList { private readonly service=inject(ProductoService); readonly productos=signal<Producto[]>([]); readonly cargando=signal(true); readonly error=signal(''); constructor(){this.service.listar(0,100).subscribe({next:r=>{this.productos.set(r.contenido);this.cargando.set(false)},error:()=>{this.error.set('No se pudieron cargar los productos.');this.cargando.set(false)}})} }
