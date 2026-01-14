import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
  
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  isLoading = false;

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { 
    validators: (group) => group.get('password')?.value === group.get('confirmPassword')?.value ? null : { mismatch: true } 
  });

  async onReset() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      const { password } = this.resetForm.value;
      const { error } = await this.authService.updatePassword(password!);
      
      if (error) {
        alert('Error: ' + error.message);
        this.isLoading = false;
      } else {
        alert('✅ Contraseña actualizada correctamente.');
        this.router.navigate(['/auth/login']);
      }
    }
  }
}