import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.scss'
})
export class MainViewComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Observable para mostrar el nombre del chef en el HTML
  user$ = this.authService.user$;

  async logout() {
    await this.authService.signOut();
    // Al cerrar sesión, el Guard nos rebotará, pero es buena práctica redirigir
    this.router.navigate(['/auth/login']);
  }

  async changePassword() {
  const newPass = prompt('Ingresa tu nueva contraseña (mín. 6 caracteres):');
  if (newPass && newPass.length >= 6) {
    const { error } = await this.authService.updatePassword(newPass);
    if (error) alert('Error: ' + error.message);
    else alert('✅ ¡Contraseña actualizada con éxito!');
  } else {
    alert('La contraseña debe tener al menos 6 caracteres.');
  }
}
}