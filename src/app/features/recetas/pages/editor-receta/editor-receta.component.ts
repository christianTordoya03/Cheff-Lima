import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { InsumosService } from '../../../../core/services/insumos.service';
import { RecetasService } from '../../../../core/services/recetas.service';
import { Insumo } from '../../../../core/interfaces/insumo';

@Component({
  selector: 'app-editor-receta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './editor-receta.component.html',
  styleUrl: './editor-receta.component.scss'
})
export class EditorRecetaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private insumosService = inject(InsumosService);
  private recetasService = inject(RecetasService);

  // CORRECCIONES DE NOMBRES PARA EL HTML
  insumos: Insumo[] = []; 
  esEdicion = false; 

  recetaForm = this.fb.group({
    nombre: ['', Validators.required],
    porciones: [1, [Validators.required, Validators.min(1)]],
    costo_total: [0],
    ingredientes: this.fb.array([])
  });

  // CORRECCIÓN NG1: Getter con el nombre exacto usado en el @for
  get ingredientesForm() {
    return this.recetaForm.get('ingredientes') as FormArray;
  }

  ngOnInit() {
    this.cargarInsumos();
  }

  async cargarInsumos() {
    const { data } = await this.insumosService.getInsumos();
    if (data) this.insumos = data;
  }

  agregarIngrediente() {
    const ingredienteForm = this.fb.group({
      insumo_id: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.001)]],
      costo: [0] 
    });
    this.ingredientesForm.push(ingredienteForm);
  }

  removerIngrediente(index: number) {
    this.ingredientesForm.removeAt(index);
    this.actualizarCalculos();
  }

  ajustarPorciones(cantidad: number) {
    const control = this.recetaForm.get('porciones');
    if (control) {
      const nuevoValor = (control.value || 1) + cantidad;
      if (nuevoValor >= 1) {
        control.setValue(nuevoValor);
      }
    }
  }

  // CORRECCIÓN NG9: Método que pide el (input) y (change) del HTML
  actualizarCalculos() {
    let total = 0;
    this.ingredientesForm.controls.forEach((grupo) => {
      const id = grupo.get('insumo_id')?.value;
      const cant = grupo.get('cantidad')?.value || 0;
      const insumo = this.insumos.find(i => i.id === id);

      if (insumo) {
        const costoParcial = cant * (insumo.costo_unitario_uso || 0);
        grupo.get('costo')?.setValue(costoParcial, { emitEvent: false });
        total += costoParcial;
      }
    });
    this.recetaForm.get('costo_total')?.setValue(total);
  }

  // CORRECCIÓN NG3: Getter para simplificar el cálculo matemático en el HTML
  get costoPorPlato(): number {
    const total = this.recetaForm.get('costo_total')?.value || 0;
    const porciones = this.recetaForm.get('porciones')?.value || 1;
    return total / porciones;
  }

  async guardarReceta() {
    if (this.recetaForm.invalid) return;
    try {
      const form = this.recetaForm.getRawValue();
      const cabecera = {
        nombre: form.nombre,
        porciones: form.porciones,
        costo_total: form.costo_total
      };
      const detalle = form.ingredientes.map((ing: any) => ({
        insumo_id: ing.insumo_id,
        cantidad_utilizada: ing.cantidad,
        costo_calculado: ing.costo
      }));

      await this.recetasService.guardarRecetaCompleta(cabecera, detalle);
      alert('✅ Receta guardada con éxito.');
      this.recetaForm.reset({ porciones: 1, costo_total: 0 });
      this.ingredientesForm.clear();
    } catch (e: any) {
      alert('❌ Error: ' + e.message);
    }
  }
}