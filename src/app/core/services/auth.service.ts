import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Inyectamos el cliente de Supabase que ya configuraste
  private supabase = inject(SupabaseService).supabase;

  // BehaviorSubject para manejar el estado del usuario en tiempo real
  private userSubject = new BehaviorSubject<User | null | undefined>(undefined);
  user$ = this.userSubject.asObservable();

  constructor() {
    // Verificar sesión inicial al cargar la app
    this.supabase.auth.getSession().then(({ data }) => {
      this.userSubject.next(data.session?.user ?? null);
    });

    // Escuchar cambios de estado (Login, Logout, Registro)
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.userSubject.next(session?.user ?? null);
    });
  }

  // Crea un nuevo usuario en Supabase
  async signUp(email: string, pass: string) {
    return await this.supabase.auth.signUp({ email, password: pass });
  }

  // Iniciar sesión
  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
  }

  // Cerrar sesión
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) console.error('Error al cerrar sesión:', error.message);
  }

  // Envía un correo con un link para resetear la clave
  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      // IMPORTANTE: Esta URL debe coincidir con la ruta que creamos arriba
      redirectTo: 'http://localhost:4200/auth/reset-password',
    });
  }

  // Actualiza la clave del usuario (sirve para el "Cambiar contraseña" interno y el de recuperación)
  async updatePassword(newPass: string) {
    return await this.supabase.auth.updateUser({
      password: newPass,
    });
  }

  // Actualiza la contraseña del usuario que llega con el token del correo
  async confirmPasswordReset(newPass: string) {
    return await this.supabase.auth.updateUser({
      password: newPass,
    });
  }

  async getCurrentUser() {
  return await this.supabase.auth.getUser();
}
}
