import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainViewComponent } from './features/dashboard/pages/main-view/main-view.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // --- Módulo de Autenticación ---
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // --- Módulo Principal Protegido ---
  {
    path: '',
    canActivate: [authGuard],
    component: MainViewComponent, // Este es el contenedor con el menú y el router-outlet
    children: [
      {
        path: 'dashboard',
        // TIP: Aquí deberías cargar un componente "Home" o de bienvenida.
        // Si no tienes uno, puedes dejarlo vacío por ahora o crear uno rápido.
        loadComponent: () => import('./features/dashboard/pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'insumos',
        loadComponent: () => import('./features/insumos/pages/lista-insumos/lista-insumos.component').then(m => m.ListaInsumosComponent)
      },
      {
        path: 'nuevaReceta',
        loadComponent: () => import('./features/recetas/pages/editor-receta/editor-receta.component').then(m => m.EditorRecetaComponent)
      },
      {
        path: 'recetario',
        loadComponent: () => import('./features/recetas/pages/recetario/recetario.component').then(m => m.RecetarioComponent)
      },
      {
        path: 'editarReceta/:id',
        loadComponent: () => import('./features/recetas/pages/editor-receta/editor-receta.component').then(m => m.EditorRecetaComponent)
      }

    ]
  }
];