import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecetasService } from '../../../../core/services/recetas.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-recetario',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModalComponent], // Agregamos el modal aquí
  templateUrl: './recetario.component.html',
  styleUrl: './recetario.component.scss'
})
export class RecetarioComponent implements OnInit {
  private recetasService = inject(RecetasService);
  recetas: any[] = [];
  cargando: boolean = true;

  // Variables para el modal de confirmación
  showModal = false;
  idAEliminar: string | null = null;

  ngOnInit() {
    this.cargarRecetas();
  }

  async cargarRecetas() {
    this.cargando = true; 
    try {
      const { data } = await this.recetasService.getRecetas();
      if (data) this.recetas = data;
    } finally {
      this.cargando = false;
    }
  }

  // Abre el modal y guarda el ID
  prepararEliminacion(id: string) {
    this.idAEliminar = id;
    this.showModal = true;
  }

  // Se ejecuta al confirmar en el modal
  async confirmarEliminacion() {
    if (!this.idAEliminar) return;

    try {
      const { error } = await this.recetasService.eliminarReceta(this.idAEliminar);
      if (error) throw error;
      
      this.recetas = this.recetas.filter(r => r.id !== this.idAEliminar);
      console.log('Receta eliminada');
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message);
    } finally {
      this.cerrarModal();
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.idAEliminar = null;
  }
}