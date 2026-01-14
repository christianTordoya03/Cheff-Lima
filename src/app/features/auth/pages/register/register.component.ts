import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  isLoading = false;

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true; // Inicia carga
      const { email, password } = this.registerForm.value;
      const { data, error } = await this.authService.signUp(email!, password!);

      if (error) {
        alert('Error al registrar: ' + error.message);
        this.isLoading = false; // Detiene carga en error
      } else {
        alert('¡Registro exitoso! Revisa tu correo para confirmar.');
        this.router.navigate(['/dashboard']);
      }
    }
  }
}