export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  estado: boolean;
  categoriaId: number;
  /** Nombre de categoría incluido en la respuesta REST usada por la guía. */
  categoriaNombre: string;
}
