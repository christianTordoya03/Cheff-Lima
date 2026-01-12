import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // 1. Importar esto

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}