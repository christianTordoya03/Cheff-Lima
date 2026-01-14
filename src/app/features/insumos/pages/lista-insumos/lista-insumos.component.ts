import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para pipes como 'number'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InsumosService } from '../../../../core/services/insumos.service';
import { Insumo } from '../../../../core/interfaces/insumo';

@Component({
  selector: 'app-lista-insumos',
  standalone: true,
  // Agregamos CommonModule aquí para solucionar el error NG8004
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lista-insumos.component.html',
  styleUrl: './lista-insumos.component.scss'
})
export class ListaInsumosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private insumosService = inject(InsumosService);

  insumos: Insumo[] = [];
  mostrarFormulario = false; // Control para el modal/sección de registro
  esEdicion = false;
  insumoSeleccionadoId?: string;

  insumoForm = this.fb.group({
    nombre: ['', Validators.required],
    precio_compra: [0, [Validators.required, Validators.min(0.1)]],
    unidad_medida: ['kg', Validators.required],
    porcentaje_merma: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.listarInsumos();
  }

  async listarInsumos() {
    const { data, error } = await this.insumosService.getInsumos();
    if (data) this.insumos = data;
  }

  // Solución al error NG9: Agregamos el método que pide el HTML
  abrirFormulario() {
    this.esEdicion = false;
    this.insumoSeleccionadoId = undefined; // IMPRESCINDIBLE: Limpiar el ID previo
    this.insumoForm.reset({
      unidad_medida: 'kg',
      porcentaje_merma: 0,
      precio_compra: 0
    });
    this.mostrarFormulario = true;
  }

  async eliminarInsumo(id: string) {
    if (!id) return;

    if (confirm('¿Estás seguro de eliminar este insumo?')) {
      await this.insumosService.deleteInsumo(id);
      this.listarInsumos();
    }
  }

  editarInsumo(insumo: Insumo) {
    this.esEdicion = true;
    this.insumoSeleccionadoId = insumo.id; // Capturamos el ID para el UPDATE
    this.insumoForm.patchValue({
      nombre: insumo.nombre,
      precio_compra: insumo.precio_compra,
      unidad_medida: insumo.unidad_medida,
      porcentaje_merma: insumo.porcentaje_merma
    });
    this.mostrarFormulario = true;
  }

  cancelar() {
    this.mostrarFormulario = false;
  }

  async guardarInsumo() {
    if (this.insumoForm.valid) {
      const datos = this.insumoForm.value;
      
      try {
        if (this.esEdicion && this.insumoSeleccionadoId) {
          // ACCIÓN: ACTUALIZAR
          await this.insumosService.updateInsumo(this.insumoSeleccionadoId, datos as any);
          console.log('Insumo actualizado con éxito');
        } else {
          // ACCIÓN: CREAR NUEVO
          await this.insumosService.createInsumo(datos as any);
          console.log('Nuevo insumo creado con éxito');
        }
        
        this.cerrarFormulario();
        this.listarInsumos();
      } catch (error) {
        console.error('Error al procesar insumo:', error);
      }
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.insumoSeleccionadoId = undefined;
    this.esEdicion = false;
  }
}