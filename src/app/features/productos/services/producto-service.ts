import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { Producto } from '../models/producto.model';

type RespuestaProductos = Producto[] | PaginaResponse<Producto>;

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  listar(pagina = 0, tamanio = 20, ordenarPor = 'nombre', direccion: 'asc' | 'desc' = 'asc'): Observable<PaginaResponse<Producto>> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);
    return this.http.get<RespuestaProductos>(this.url, { params }).pipe(
      map(respuesta => {
        if (!Array.isArray(respuesta)) return respuesta;

        const inicio = pagina * tamanio;
        const totalPaginas = Math.ceil(respuesta.length / tamanio);
        return {
          contenido: respuesta.slice(inicio, inicio + tamanio),
          pagina,
          tamanio,
          totalElementos: respuesta.length,
          totalPaginas,
          ultima: pagina >= Math.max(totalPaginas - 1, 0),
        } satisfies PaginaResponse<Producto>;
      }),
    );
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }
}
