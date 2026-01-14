import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Cierra la sesión del Chef y lo envía al Login.
   */
  async logout() {
    await this.authService.signOut();
    // Al cerrar sesión, el Guard nos rebotará, pero es buena práctica redirigir
    this.router.navigate(['/auth/login']);
  }
}