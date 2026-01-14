import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Solución: Declaramos la propiedad que falta
  isLoading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true; // Iniciamos el estado de carga
      
      const { email, password } = this.loginForm.value;
      const { data, error } = await this.authService.signIn(email!, password!);

      if (error) {
        alert('Error: ' + error.message);
        this.isLoading = false; // Detenemos la carga si hay error
      } else {
        // Al loguearte con éxito, vamos al dashboard
        this.router.navigate(['/dashboard']);
      }
    }
  }

  async onForgotPassword() {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      alert('Por favor, escribe primero tu correo electrónico.');
      return;
    }

    this.isLoading = true; // También podemos usarlo aquí
    const { error } = await this.authService.resetPassword(email);
    this.isLoading = false;

    if (error) alert('Error: ' + error.message);
    else alert('📧 Se ha enviado un enlace de recuperación a tu correo.');
  }
}