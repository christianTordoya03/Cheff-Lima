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

  async eliminarReceta(id: string) {
  return await this.supabase
    .from('recetas')
    .delete()
    .eq('id', id);
}

// Obtener una receta específica con sus insumos para editar
async getRecetaById(id: string) {
  return await this.supabase
    .from('recetas')
    .select(`
      *,
      receta_detalles (
        *,
        insumos (*)
      )
    `)
    .eq('id', id)
    .single();
}

async actualizarRecetaCompleta(recetaId: string, receta: any, ingredientes: any[]) {
  // 1. Actualizar cabecera
  const { error: errorReceta } = await this.supabase
    .from('recetas')
    .update(receta)
    .eq('id', recetaId);

  if (errorReceta) return { error: errorReceta };

  // 2. Borrar detalles antiguos
  await this.supabase.from('receta_detalles').delete().eq('receta_id', recetaId);

  // 3. Insertar detalles nuevos
  const detallesConId = ingredientes.map(ing => ({
    ...ing,
    receta_id: recetaId
  }));

  return await this.supabase.from('receta_detalles').insert(detallesConId);
}

  /**
   * Guarda una receta y sus ingredientes asociados.
   */
  async guardarRecetaCompleta(receta: any, ingredientes: any[]) {
    // 1. Insertar en 'recetas' (nombre_plato, costo_total, etc)
    const { data: recetaGuardada, error: errorReceta } = await this.supabase
      .from('recetas')
      .insert(receta)
      .select()
      .single();

    if (errorReceta) throw errorReceta;

    // 2. Insertar en 'receta_detalles'
    const detallesConId = ingredientes.map(ing => ({
      ...ing,
      receta_id: recetaGuardada.id
    }));

    return await this.supabase
      .from('receta_detalles')
      .insert(detallesConId);
  }
}