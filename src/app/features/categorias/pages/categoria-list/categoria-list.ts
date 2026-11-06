import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoriaService } from '../../services/categoria-service';
import { Categoria } from '../../models/categoria.model';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({selector:'app-categoria-list',imports:[RouterLink,SiPermiso],templateUrl:'./categoria-list.html',styleUrl:'./categoria-list.css'})
export class CategoriaList implements OnInit {
  private readonly service=inject(CategoriaService); protected readonly categorias=signal<Categoria[]>([]);
  protected readonly filtro=signal(''); protected readonly cargando=signal(false); protected readonly error=signal<string|null>(null);
  protected readonly filtradas=computed(()=>this.categorias().filter(c=>c.nombre.toLowerCase().includes(this.filtro().trim().toLowerCase())));
  ngOnInit(){this.cargar();} cargar(){this.cargando.set(true);this.service.listar().subscribe({next:v=>{this.categorias.set(v);this.cargando.set(false)},error:(e:HttpErrorResponse)=>{this.error.set(mensajeError(e));this.cargando.set(false)}})}
  eliminar(c:Categoria){if(!confirm(`¿Eliminar la categoría "${c.nombre}"?`))return;this.service.eliminar(c.id).subscribe({next:()=>this.cargar(),error:(e:HttpErrorResponse)=>this.error.set(mensajeError(e))})}
}
