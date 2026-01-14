import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router'; 
import { InsumosService } from '../../../../core/services/insumos.service';
import { RecetasService } from '../../../../core/services/recetas.service';
import { Insumo } from '../../../../core/interfaces/insumo';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-editor-receta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ConfirmModalComponent],
  templateUrl: './editor-receta.component.html',
  styleUrl: './editor-receta.component.scss'
})
export class EditorRecetaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private insumosService = inject(InsumosService);
  private recetasService = inject(RecetasService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  insumos: Insumo[] = []; 
  esEdicion = false; 
  recetaId: string | null = null;
  showModalEliminar = false;
  indiceAEliminar: number | null = null;

  recetaForm = this.fb.group({
    nombre: ['', Validators.required],
    porciones: [1, [Validators.required, Validators.min(1)]],
    costo_total: [0],
    ingredientes: this.fb.array([])
  });

  get ingredientesForm() {
    return this.recetaForm.get('ingredientes') as FormArray;
  }

  async ngOnInit() {
    await this.cargarInsumos();
    
    // Verificar si recibimos un ID por la URL para editar
    this.recetaId = this.route.snapshot.paramMap.get('id');
    if (this.recetaId) {
      this.esEdicion = true;
      await this.cargarDatosReceta(this.recetaId);
    }
  }

  async cargarInsumos() {
    const { data } = await this.insumosService.getInsumos();
    if (data) this.insumos = data;
  }

  pedirConfirmacionEliminar(index: number) {
    this.indiceAEliminar = index;
    this.showModalEliminar = true;
  }

  confirmarEliminacion() {
    if (this.indiceAEliminar !== null) {
      this.removerIngrediente(this.indiceAEliminar);
    }
    this.cerrarModal();
  }

  cerrarModal() {
    this.showModalEliminar = false;
    this.indiceAEliminar = null;
  }

  async cargarDatosReceta(id: string) {
    const { data } = await this.recetasService.getRecetaById(id);
    if (data) {
      this.recetaForm.patchValue({
        nombre: data.nombre_plato,
        porciones: data.porciones,
        costo_total: data.costo_total
      });

      this.ingredientesForm.clear();
      data.receta_detalles.forEach((detalle: any) => {
        this.ingredientesForm.push(this.fb.group({
          insumo_id: [detalle.insumo_id, Validators.required],
          cantidad: [detalle.cantidad_utilizada, [Validators.required, Validators.min(0.001)]],
          costo: [detalle.costo_calculado]
        }));
      });
    }
  }

  agregarIngrediente() {
  const ingredienteForm = this.fb.group({
    insumo_id: ['', Validators.required],
    cantidad: [0, [Validators.required, Validators.min(0.001)]],
    costo: [0] 
  });
  this.ingredientesForm.push(ingredienteForm);

  // Scroll automático al último elemento creado
  setTimeout(() => {
    const items = document.querySelectorAll('.ingredient-item');
    const ultimoItem = items[items.length - 1];
    if (ultimoItem) {
      ultimoItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

  removerIngrediente(index: number) {
    this.ingredientesForm.removeAt(index);
    this.actualizarCalculos();
  }

  ajustarPorciones(cantidad: number) {
    const control = this.recetaForm.get('porciones');
    if (control) {
      const nuevoValor = (Number(control.value) || 1) + cantidad;
      if (nuevoValor >= 1) {
        control.setValue(nuevoValor);
        this.actualizarCalculos();
      }
    }
  }

  actualizarCalculos() {
    let total = 0;
    this.ingredientesForm.controls.forEach((grupo) => {
      const id = grupo.get('insumo_id')?.value;
      const cant = grupo.get('cantidad')?.value || 0;
      const insumo = this.insumos.find(i => i.id === id);

      if (insumo) {
        // Usamos el costo_unitario_uso que ya calculamos en el servicio de insumos
        const costoParcial = cant * (insumo.costo_unitario_uso || 0);
        grupo.get('costo')?.setValue(costoParcial, { emitEvent: false });
        total += costoParcial;
      }
    });
    this.recetaForm.get('costo_total')?.setValue(total);
  }

  get costoPorPlato(): number {
    const total = this.recetaForm.get('costo_total')?.value || 0;
    const porciones = this.recetaForm.get('porciones')?.value || 1;
    return total / porciones;
  }

  async guardarReceta() {
    if (this.recetaForm.invalid || this.ingredientesForm.length === 0) {
      alert('Por favor, completa los datos y añade al menos un ingrediente.');
      return;
    }

    try {
      const formValue = this.recetaForm.getRawValue();
      const { data: { user } } = await this.authService.getCurrentUser();
      
      if (!user) throw new Error('Usuario no autenticado');
      
      const recetaData = {
        nombre_plato: formValue.nombre,
        precio_venta: 0,
        metodo_calculo: 'exacto',
        user_id: user.id,
        porciones: formValue.porciones,
        costo_total: formValue.costo_total
      };

      const detallesIngredientes = formValue.ingredientes.map((ing: any) => ({
        insumo_id: ing.insumo_id,
        cantidad_utilizada: ing.cantidad,
        costo_calculado: ing.costo
      }));

      let result;
      if (this.esEdicion && this.recetaId) {
        result = await this.recetasService.actualizarRecetaCompleta(this.recetaId, recetaData, detallesIngredientes);
      } else {
        result = await this.recetasService.guardarRecetaCompleta(recetaData, detallesIngredientes);
      }

      if (result.error) throw result.error;

      alert(this.esEdicion ? '✅ ¡Receta actualizada!' : '✅ ¡Receta guardada!');
      this.router.navigate(['/recetas']);
      
    } catch (error: any) {
      console.error('Error al procesar:', error.message);
      alert('❌ Error al procesar la receta.');
    }
  }
}