import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InsumosService } from '../../../../core/services/insumos.service';
import { Insumo } from '../../../../core/interfaces/insumo';

// Diccionario de Inteligencia: Clasifica el comportamiento de insumos peruanos
const PRODUCT_RULES: any = {
  limon: {
    modo: 'extraccion',
    compra: 'kg',
    uso: 'ml',
    msg: '✨ Modo Extracción: Calculando zumo.',
  },
  maracuya: {
    modo: 'extraccion',
    compra: 'kg',
    uso: 'ml',
    msg: '✨ Modo Extracción: Calculando pulpa.',
  },
  lomo: {
    modo: 'merma',
    compra: 'kg',
    uso: 'gr',
    msg: '🥩 Modo Merma: Calculando carne limpia.',
  },
  aji: {
    modo: 'merma',
    compra: 'kg',
    uso: 'gr',
    msg: '🌶️ Modo Merma: Calculando sin pepas/venas.',
  },
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
  modoInteligente: 'merma' | 'extraccion' | 'estandar' = 'estandar';
  mensajeInteligente = '';

  insumoForm = this.fb.group({
    nombre: ['', [Validators.required]],
    unidad_medida: ['kg', [Validators.required]],
    unidad_uso: ['gr', [Validators.required]],
    precio_compra: [0, [Validators.required, Validators.min(0.1)]],
    porcentaje_merma: [0, [Validators.min(0), Validators.max(99)]],
    costo_unitario_uso: [0, [Validators.min(0), Validators.max(99)]],
  });

  ngOnInit() {
    this.cargarInsumos();
  }

  detectarProducto(event: Event) {
    const nombre = (event.target as HTMLInputElement).value.toLowerCase();
    const regla = Object.keys(PRODUCT_RULES).find((key) =>
      nombre.includes(key)
    );

    if (regla) {
      const info = PRODUCT_RULES[regla];
      this.modoInteligente = info.modo;
      this.mensajeInteligente = info.msg;
      this.insumoForm.patchValue({
        unidad_medida: info.compra,
        unidad_uso: info.uso,
      });
    } else {
      this.modoInteligente = 'estandar';
      this.mensajeInteligente = '';
    }
  }

  calcularDesdeMerma(pb: string, pm: string) {
    const bruto = parseFloat(pb) * 1000;
    const mermaPeso = parseFloat(pm);

    if (bruto > 0) {
      // Merma (%) = (PM / PB) x 100
      const porcMerma = (mermaPeso / bruto) * 100;
      this.insumoForm.patchValue({
        porcentaje_merma: Number(porcMerma.toFixed(2)),
      });
    }
  }

  calcularMetricas(pb: string, pu: string, pm: string) {
  const pesoBruto = parseFloat(pb) * 1000; // Normalizamos kg a gr
  const productoUtil = parseFloat(pu);
  const pesoMerma = parseFloat(pm);
  const precioTotal = this.insumoForm.get('precio_compra')?.value || 0;

  if (pesoBruto > 0) {
    // 1. Porcentaje de Rendimiento: (PU / PB) * 100
    const rendimiento = (productoUtil / pesoBruto) * 100;
    
    // 2. Porcentaje de Merma: (PM / PB) * 100 o (100 - Rendimiento)
    const merma = 100 - rendimiento;

    // 3. Costo por Unidad de Uso (CPU): Precio / PU
    // Esto evita que el precio del limón o maracuyá se dispare a S/ 100
    const costoUnitario = productoUtil > 0 ? precioTotal / productoUtil : 0;

    this.insumoForm.patchValue({
      porcentaje_merma: Number(merma.toFixed(2)),
      // Guardamos el costo unitario para usarlo en el HTML
      costo_unitario_uso: costoUnitario 
    });
  }
}

  calcularDesdeUtil(pb: string, pu: string) {
    const bruto = parseFloat(pb) * 1000; // Normalización a gramos
    const util = parseFloat(pu);

    if (bruto > 0) {
      const rendimiento = (util / bruto) * 100;
      this.insumoForm.patchValue({
        porcentaje_merma: Number((100 - rendimiento).toFixed(2)),
      });
      // Aquí podrías auto-llenar el campo PM en la UI: bruto - util
    }
  }

  async cargarInsumos() {
    const { data, error } = await this.insumosService.getInsumos();
    if (data) this.insumos = data;
    if (error) console.error('Error al cargar:', error.message);
  }

  async guardarInsumo() {
    if (this.insumoForm.valid) {
      const nuevoInsumo = this.insumoForm.value as Insumo;
      const { error } = await this.insumosService.createInsumo(nuevoInsumo);

      if (error) alert('Error: ' + error.message);
      else {
        alert('✅ Insumo guardado correctamente');
        this.insumoForm.reset({
          unidad_medida: 'kg',
          unidad_uso: 'gr',
          precio_compra: 0,
          porcentaje_merma: 0,
        });
        this.cargarInsumos();
      }
    }
  }
}
