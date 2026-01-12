
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { InsumosService } from '../../../../core/services/insumos.service';
import { Insumo } from '../../../../core/interfaces/insumo';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-editor-receta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editor-receta.component.html',
  styleUrl: './editor-receta.component.scss'
})
export class EditorRecetaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private insumosService = inject(InsumosService);

  insumosDisponibles: Insumo[] = [];
  costoTotalReceta = 0;

  recetaForm = this.fb.group({
    nombre: ['', Validators.required],
    porciones: [1, [Validators.required, Validators.min(1)]],
    ingredientes: this.fb.array([]) // Lista dinámica de ingredientes
  });

  get ingredientes() {
    return this.recetaForm.get('ingredientes') as FormArray;
  }

  ngOnInit() {
    this.cargarInsumos();
  }

  async cargarInsumos() {
    const { data } = await this.insumosService.getInsumos();
    if (data) this.insumosDisponibles = data;
  }

  agregarIngrediente() {
    const ingredienteForm = this.fb.group({
      insumo_id: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      costo_parcial: [{ value: 0, disabled: true }]
    });

    this.ingredientes.push(ingredienteForm);
  }

  removerIngrediente(index: number) {
    this.ingredientes.removeAt(index);
    this.calcularCostoTotal();
  }

  onIngredienteChange(index: number) {
    const grupo = this.ingredientes.at(index);
    const insumoId = grupo.get('insumo_id')?.value;
    const cantidad = grupo.get('cantidad')?.value || 0;

    const insumo = this.insumosDisponibles.find(i => i.id === insumoId);
    
    if (insumo) {
      // cantidad * costo_unitario_uso (nuestro valor real de S/ 0.034)
      const costo = cantidad * (insumo.costo_unitario_uso || 0);
      grupo.get('costo_parcial')?.setValue(costo.toFixed(2));
      this.calcularCostoTotal();
    }
  }

  calcularCostoTotal() {
    this.costoTotalReceta = this.ingredientes.controls.reduce((acc, control) => {
      return acc + parseFloat(control.get('costo_parcial')?.value || 0);
    }, 0);
  }

  async guardarReceta() {
    if (this.recetaForm.valid) {
      console.log('Guardando receta:', this.recetaForm.getRawValue());
      // Aquí irá la lógica para insertar en Supabase (tabla recetas y receta_insumos)
    }
  }
}