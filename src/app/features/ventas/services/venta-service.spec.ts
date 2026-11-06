import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { VentaService } from './venta-service';

describe('VentaService', () => {
  let service: VentaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VentaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('ordena la consulta por fechaRegistro descendente', async () => {
    const resultado = firstValueFrom(service.buscar({
      clienteId: null,
      estado: null,
      desde: null,
      hasta: null,
    }));
    const request = httpMock.expectOne(request => request.url.endsWith('/ventas/buscar'));
    expect(request.request.params.get('ordenarPor')).toBe('fechaRegistro');
    expect(request.request.params.get('direccion')).toBe('desc');
    request.flush({
      contenido: [],
      pagina: 0,
      tamanio: 10,
      totalElementos: 0,
      totalPaginas: 0,
      ultima: true,
    });
    await resultado;
  });

  it('adapta una lista del backend a la página solicitada', async () => {
    const ventas = Array.from({ length: 5 }, (_, indice) => ({
      id: indice + 1,
      fecha: '2026-10-09T12:00:00',
      clienteId: 1,
      clienteNombre: 'Cliente',
      estado: 'REGISTRADA' as const,
      total: 10,
      detalles: [],
    }));
    const resultado = firstValueFrom(service.buscar({
      clienteId: null,
      estado: null,
      desde: null,
      hasta: null,
    }, 1, 2));
    httpMock.expectOne(request =>
      request.url.endsWith('/ventas/buscar') && request.params.get('pagina') === '1',
    ).flush(ventas);

    expect(await resultado).toEqual({
      contenido: ventas.slice(2, 4),
      pagina: 1,
      tamanio: 2,
      totalElementos: 5,
      totalPaginas: 3,
      ultima: false,
    });
  });
});
