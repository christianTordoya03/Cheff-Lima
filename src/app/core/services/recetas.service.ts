// src/app/core/services/recetas.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class RecetasService {
  private supabase = inject(SupabaseService).supabase;

  /**
   * Guarda una receta y todos sus ingredientes asociados en Supabase.
   */
  async guardarRecetaCompleta(receta: any, ingredientes: any[]) {
    const { data: { user } } = await this.supabase.auth.getUser();

    // 1. Insertar la cabecera de la receta
    const { data: nuevaReceta, error: errorReceta } = await this.supabase
      .from('recetas')
      .insert([{ ...receta, user_id: user?.id }])
      .select()
      .single();

    if (errorReceta) throw errorReceta;

    // 2. Vincular ingredientes con el ID de la receta creada
    const detalleIngredientes = ingredientes.map(ing => ({
      ...ing,
      receta_id: nuevaReceta.id
    }));

    // 3. Inserción masiva de ingredientes
    const { error: errorIngredientes } = await this.supabase
      .from('receta_insumos')
      .insert(detalleIngredientes);

    if (errorIngredientes) throw errorIngredientes;

    return nuevaReceta;
  }
}