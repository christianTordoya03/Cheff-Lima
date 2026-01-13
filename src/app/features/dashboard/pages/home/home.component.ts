import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InsumosService } from '../../../../core/services/insumos.service';
import { RecetasService } from '../../../../core/services/recetas.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private insumosService = inject(InsumosService);
  private recetasService = inject(RecetasService);

  // Declaramos las variables para corregir el error NG9
  insumosCount: number = 0;
  recetasCount: number = 0;
  loading: boolean = true;

  ngOnInit() {
    this.cargarEstadisticas();
  }

  async cargarEstadisticas() {
    try {
      this.loading = true;
      
      // Obtenemos los datos reales de Supabase
      const { data: insumos } = await this.insumosService.getInsumos();
      const { data: recetas } = await this.recetasService.getRecetas(); // Asegúrate que este método exista

      this.insumosCount = insumos?.length || 0;
      this.recetasCount = recetas?.length || 0;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      this.loading = false;
    }
  }
}