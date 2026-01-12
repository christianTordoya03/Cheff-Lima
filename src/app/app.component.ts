import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // Importante: RouterOutlet debe estar aquí
  template: '<router-outlet></router-outlet>', // Template mínimo para probar
})
export class AppComponent implements OnInit {
  ngOnInit() {
    console.log('🚀 AppComponent Cargado');
  }
}