import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InsumosService } from '../../../../core/services/insumos.service';
import { Insumo } from '../../../../core/interfaces/insumo';

const PRODUCT_RULES: any = {
  limon: { modo: 'extraccion', compra: 'kg', uso: 'ml', msg: '✨ Modo Extracción: Calculando zumo.' },
  maracuya: { modo: 'extraccion', compra: 'kg', uso: 'ml', msg: '✨ Modo Extracción: Calculando pulpa.' },
  lomo: { modo: 'merma', compra: 'kg', uso: 'gr', msg: '🥩 Modo Merma: Calculando carne limpia.' },
  aji: { modo: 'merma', compra: 'kg', uso: 'gr', msg: '🌶️ Modo Merma: Calculando sin pepas/venas.' },
};

@Component({
  selector: 'app-lista-insumos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './lista-insumos.component.html',
  styleUrl: './lista-insumos.component.scss',
})
export class ListaInsumosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private insumosService = inject(InsumosService);

  insumos: Insumo[] = [];
  insumoEditandoId: string | null = null;
  mensajeInteligente = '';

  insumoForm = this.fb.group({
    nombre: ['', [Validators.required]],
    unidad_medida: ['kg', [Validators.required]],
    unidad_uso: ['gr', [Validators.required]],
    precio_compra: [0, [Validators.required, Validators.min(0.1)]],
    porcentaje_merma: [0],
    costo_unitario_uso: [0]
  });

  ngOnInit() {
    this.cargarInsumos();
  }

  detectarProducto(event: Event) {
    const nombre = (event.target as HTMLInputElement).value.toLowerCase();
    const regla = Object.keys(PRODUCT_RULES).find((key) => nombre.includes(key));

    if (regla) {
      const info = PRODUCT_RULES[regla];
      this.mensajeInteligente = info.msg;
      this.insumoForm.patchValue({ unidad_medida: info.compra, unidad_uso: info.uso });
    } else {
      this.mensajeInteligente = '';
    }
  }

  actualizarCalculos(pb: string, pu: string) {
    const precioTotal = this.insumoForm.get('precio_compra')?.value || 0;
    const unidadCompra = this.insumoForm.get('unidad_medida')?.value;
    const unidadUso = this.insumoForm.get('unidad_uso')?.value;

    let pesoBruto = parseFloat(pb) || 0;
    let productoUtil = parseFloat(pu) || 0;

    if (pesoBruto > 0) {
      let pbNormalizado = pesoBruto;
      if ((unidadCompra === 'kg' || unidadCompra === 'lt') && (unidadUso === 'gr' || unidadUso === 'ml')) {
        pbNormalizado = pesoBruto * 1000;
      }

      const rendimiento = (productoUtil / pbNormalizado) * 100;
      const merma = 100 - rendimiento;
      const costoUnitario = productoUtil > 0 ? precioTotal / productoUtil : 0;

      this.insumoForm.patchValue({
        porcentaje_merma: Number(merma.toFixed(2)),
        costo_unitario_uso: costoUnitario
      });
    }
  }

  async cargarInsumos() {
    const { data } = await this.insumosService.getInsumos();
    if (data) this.insumos = data;
  }

  editarInsumo(item: Insumo) {
    this.insumoEditandoId = item.id || null;
    this.insumoForm.patchValue({
      nombre: item.nombre,
      unidad_medida: item.unidad_medida,
      unidad_uso: item.unidad_uso,
      precio_compra: item.precio_compra,
      porcentaje_merma: item.porcentaje_merma,
      costo_unitario_uso: item.costo_unitario_uso
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async guardarInsumo() {
    if (this.insumoForm.valid) {
      const datos = this.insumoForm.value as Insumo;
      
      if (this.insumoEditandoId) {
        await this.insumosService.updateInsumo(this.insumoEditandoId, datos);
        alert('✅ Insumo actualizado');
      } else {
        await this.insumosService.createInsumo(datos);
        alert('✅ Insumo guardado');
      }

      this.resetearFormulario();
      this.cargarInsumos();
    }
  }

  async eliminarInsumo(id: string | undefined) {
  if (!id) return;

  const confirmacion = confirm('¿Estás seguro de eliminar este insumo? Esta acción no se puede deshacer.');
  
  if (confirmacion) {
    const { error } = await this.insumosService.deleteInsumo(id);
    
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      alert('🗑️ Insumo eliminado con éxito');
      this.cargarInsumos(); // Refrescamos la lista [cite: 2026-01-10]
    }
  }
}

  resetearFormulario() {
    this.insumoEditandoId = null;
    this.insumoForm.reset({ unidad_medida: 'kg', unidad_uso: 'gr', precio_compra: 0, porcentaje_merma: 0, costo_unitario_uso: 0 });
    this.mensajeInteligente = '';
  }
}