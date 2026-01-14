import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  // Configuración del contenido
  @Input() visible: boolean = false;
  @Input() titulo: string = '¿Estás seguro Chef?';
  @Input() mensaje: string = 'Esta acción no se puede deshacer.';
  @Input() textoConfirmar: string = 'Sí, eliminar';
  @Input() tipo: 'danger' | 'warning' = 'danger';

  // Eventos de salida
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  onConfirm() {
    this.confirmar.emit();
  }

  onCancel() {
    this.cancelar.emit();
  }
}