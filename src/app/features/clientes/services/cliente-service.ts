import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { Cliente, ClienteRequest } from '../models/cliente.model';

type RespuestaClientes = Cliente[] | PaginaResponse<Cliente>;

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/clientes`;

  /**
   * Sin argumentos conserva la firma usada por el CRUD de Clientes y devuelve un arreglo,
   * incluso si el backend responde con una estructura paginada.
   * Con argumentos devuelve la página solicitada para los módulos que requieren paginación.
   */
  listar(): Observable<Cliente[]>;
  listar(pagina: number, tamanio?: number, ordenarPor?: string, direccion?: 'asc' | 'desc'): Observable<PaginaResponse<Cliente>>;
  listar(pagina?: number, tamanio = 20, ordenarPor = 'apellidos', direccion: 'asc' | 'desc' = 'asc'):
    Observable<Cliente[] | PaginaResponse<Cliente>> {
    const paginado = pagina !== undefined;
    const numeroPagina = pagina ?? 0;
    let params = new HttpParams();
    if (paginado) {
      params = params
        .set('pagina', numeroPagina)
        .set('tamanio', tamanio)
        .set('ordenarPor', ordenarPor)
        .set('direccion', direccion);
    }

    return this.http.get<RespuestaClientes>(this.url, { params }).pipe(
      map(respuesta => {
        if (!paginado) {
          return Array.isArray(respuesta)
            ? respuesta
            : (respuesta as PaginaResponse<Cliente>).contenido;
        }
        if (!Array.isArray(respuesta)) return respuesta;

        const inicio = numeroPagina * tamanio;
        const contenido = respuesta.slice(inicio, inicio + tamanio);
        const totalPaginas = Math.ceil(respuesta.length / tamanio);
        return {
          contenido,
          pagina: numeroPagina,
          tamanio,
          totalElementos: respuesta.length,
          totalPaginas,
          ultima: numeroPagina >= Math.max(totalPaginas - 1, 0),
        } satisfies PaginaResponse<Cliente>;
      }),
    );
  }

  listarPaginado(pagina = 0, tamanio = 20, ordenarPor = 'apellidos', direccion: 'asc' | 'desc' = 'asc'):
    Observable<PaginaResponse<Cliente>> {
    return this.listar(pagina, tamanio, ordenarPor, direccion);
  }

  obtener(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  crear(dto: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, dto);
  }

  actualizar(id: number, dto: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
