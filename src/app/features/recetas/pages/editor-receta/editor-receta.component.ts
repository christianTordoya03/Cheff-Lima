import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { InsumosService } from '../../../../core/services/insumos.service';
import { RecetasService } from '../../../../core/services/recetas.service';
import { Insumo } from '../../../../core/interfaces/insumo';

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
  private recetasService = inject(RecetasService);

  insumosDisponibles: Insumo[] = [];
  costoTotalReceta = 0;

  recetaForm = this.fb.group({
    nombre: ['', Validators.required],
    porciones: [1, [Validators.required, Validators.min(1)]],
    ingredientes: this.fb.array([])
  });

  get ingredientes() {
    return this.recetaForm.get('ingredientes') as FormArray;
  }

  // Dentro de la clase EditorRecetaComponent

  // Función para incrementar porciones de forma segura
  ajustarPorciones(cantidad: number) {
    const control = this.recetaForm.get('porciones');
    if (control) {
      const valorActual = control.value || 1;
      const nuevoValor = valorActual + cantidad;
      // Evitamos que las porciones sean menores a 1
      if (nuevoValor >= 1) {
        control.setValue(nuevoValor);
        this.calcularCostoTotal();
      }
    }
  }

  // Getter para usar en el [disabled] del HTML de forma limpia
  get porcionesActuales(): number {
    return this.recetaForm.get('porciones')?.value || 1;
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
      cantidad: [0, [Validators.required, Validators.min(0.001)]],
      costo_parcial: [{ value: 0, disabled: true }]
    });
    this.ingredientes.push(ingredienteForm);
  }

  // Corregido: Nombre coincide con el HTML
  removerIngrediente(index: number) {
    this.ingredientes.removeAt(index);
    this.calcularCostoTotal();
  }

  onIngredienteChange(index: number) {
    const grupo = this.ingredientes.at(index);
    const id = grupo.get('insumo_id')?.value;
    const cant = grupo.get('cantidad')?.value || 0;
    const insumo = this.insumosDisponibles.find(i => i.id === id);

    if (insumo) {
      const parcial = cant * (insumo.costo_unitario_uso || 0);
      grupo.get('costo_parcial')?.setValue(parcial.toFixed(2));
      this.calcularCostoTotal();
    }
  }

  // Corregido: Nombre coincide con el HTML
  calcularCostoTotal() {
    this.costoTotalReceta = this.ingredientes.controls.reduce((acc, ctrl) => {
      return acc + parseFloat(ctrl.get('costo_parcial')?.value || 0);
    }, 0);
  }

  async guardarReceta() {
    if (this.recetaForm.invalid) return;

    try {
      const form = this.recetaForm.getRawValue();
      const cabecera = {
        nombre: form.nombre,
        porciones: form.porciones,
        costo_total: this.costoTotalReceta
      };
      const detalle = form.ingredientes.map((ing: any) => ({
        insumo_id: ing.insumo_id,
        cantidad_utilizada: ing.cantidad,
        costo_calculado: parseFloat(ing.costo_parcial)
      }));

      await this.recetasService.guardarRecetaCompleta(cabecera, detalle);
      alert('✅ Receta guardada en Supabase');
      this.recetaForm.reset({ porciones: 1 });
      this.ingredientes.clear();
      this.costoTotalReceta = 0;
    } catch (e: any) {
      alert('❌ Error: ' + e.message);
    }
  }
}