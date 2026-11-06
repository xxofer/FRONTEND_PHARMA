import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { FiltroVentas, Venta, VentaRequest } from '../models/venta.model';

type RespuestaVentas = Venta[] | PaginaResponse<Venta>;

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ventas`;

  registrar(dto: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.url, dto);
  }

  obtener(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.url}/${id}`);
  }

  buscar(filtro: FiltroVentas, pagina = 0, tamanio = 10): Observable<PaginaResponse<Venta>> {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', 'fechaRegistro')
      .set('direccion', 'desc');
    if (filtro.clienteId !== null) params = params.set('clienteId', filtro.clienteId);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.desde) params = params.set('desde', filtro.desde);
    if (filtro.hasta) params = params.set('hasta', filtro.hasta);
    return this.http.get<RespuestaVentas>(`${this.url}/buscar`, { params }).pipe(
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
        } satisfies PaginaResponse<Venta>;
      }),
    );
  }
}
