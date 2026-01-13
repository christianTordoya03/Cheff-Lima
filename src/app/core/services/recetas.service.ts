import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class RecetasService {
  private supabase = inject(SupabaseService).supabase;

  /**
   * Obtiene la lista de recetas del usuario autenticado.
   * Supabase filtrará automáticamente por user_id gracias a las políticas RLS.
   */
  async getRecetas() {
    return await this.supabase
      .from('recetas')
      .select('*')
      .order('created_at', { ascending: false });
  }

  /**
   * Guarda una receta y sus ingredientes asociados.
   */
  async guardarRecetaCompleta(receta: any, ingredientes: any[]) {
    const { data: { user } } = await this.supabase.auth.getUser();

    // 1. Insertar cabecera
    const { data: nuevaReceta, error: errorReceta } = await this.supabase
      .from('recetas')
      .insert([{ ...receta, user_id: user?.id }])
      .select()
      .single();

    if (errorReceta) throw errorReceta;

    // 2. Insertar ingredientes vinculados
    const detalleIngredientes = ingredientes.map(ing => ({
      ...ing,
      receta_id: nuevaReceta.id
    }));

    const { error: errorIngredientes } = await this.supabase
      .from('receta_insumos')
      .insert(detalleIngredientes);

    if (errorIngredientes) throw errorIngredientes;

    return nuevaReceta;
  }
}