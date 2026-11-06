import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Producto } from '../models/producto.model';
import { ProductoService } from './producto-service';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('normaliza la respuesta en arreglo a una página', async () => {
    const productos: Producto[] = Array.from({ length: 5 }, (_, indice) => ({
      id: indice + 1,
      nombre: `Producto ${indice + 1}`,
      precio: 10,
      stock: 5,
      estado: true,
      categoriaId: 1,
      categoriaNombre: 'General',
    }));
    const resultado = firstValueFrom(service.listar(1, 2));
    httpMock.expectOne(request =>
      request.url.endsWith('/productos') && request.params.get('pagina') === '1',
    ).flush(productos);
    expect(await resultado).toEqual({
      contenido: productos.slice(2, 4),
      pagina: 1,
      tamanio: 2,
      totalElementos: 5,
      totalPaginas: 3,
      ultima: false,
    });
  });
});
