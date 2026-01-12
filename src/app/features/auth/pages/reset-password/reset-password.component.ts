import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { 
    validators: (group) => group.get('password')?.value === group.get('confirmPassword')?.value ? null : { mismatch: true } 
  });

  async onReset() {
    if (this.resetForm.valid) {
      const { error } = await this.authService.confirmPasswordReset(this.resetForm.value.password!);
      if (error) alert('Error: ' + error.message);
      else {
        alert('✅ Contraseña actualizada. Entrando al sistema...');
        this.router.navigate(['/dashboard']);
      }
    }
  }
}