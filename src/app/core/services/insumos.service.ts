import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Insumo } from '../interfaces/insumo';

@Injectable({
  providedIn: 'root'
})
export class InsumosService {
  private supabase = inject(SupabaseService).supabase;

  /**
   * Obtiene todos los insumos que pertenecen al chef autenticado.
   * Gracias al RLS, Supabase filtrará automáticamente por user_id.
   */
  async getInsumos() {
    return await this.supabase
      .from('insumos')
      .select('*')
      .order('nombre', { ascending: true });
  }

  /**
   * Registra un nuevo insumo (ej: Limón de Unicachi) vinculándolo al ID del usuario.
   */
  async createInsumo(insumo: Insumo) {
    const { data: { user } } = await this.supabase.auth.getUser();

    return await this.supabase
      .from('insumos')
      .insert({
        ...insumo,
        user_id: user?.id
      });
  }

  async updateInsumo(id: string, insumo: Insumo) {
    return await this.supabase
      .from('insumos')
      .update({ ...insumo })
      .eq('id', id);
  }

  async deleteInsumo(id: string) {
  return await this.supabase
    .from('insumos')
    .delete()
    .eq('id', id);
}
}