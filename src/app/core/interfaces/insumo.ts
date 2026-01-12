export interface Insumo {
  id?: string;
  user_id?: string;
  nombre: string;
  unidad_medida: string; // Compra (kg, un)
  unidad_uso: string;    // Uso (lt, gr, ml)
  precio_compra: number;
  porcentaje_merma: number;
  created_at?: string;
  costo_unitario_uso: number;
}