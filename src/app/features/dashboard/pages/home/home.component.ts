import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  private router = inject(Router);
  private insumosService = inject(InsumosService);
  private recetasService = inject(RecetasService);

  insumosCount = 0;
  recetasCount = 0;

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    const { data: insumos } = await this.insumosService.getInsumos();
    const { data: recetas } = await this.recetasService.getRecetas();
    
    this.insumosCount = insumos?.length || 0;
    this.recetasCount = recetas?.length || 0;
  }

  irARecetario() {
    this.router.navigate(['/recetas']);
  }
}