import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [
    RouterLink
  ],
  template: `
    <h1>Üdvözöllek az Egészségügyi Adatkezelőben!</h1>

    <nav>
      <button routerLink="/login">Bejelentkezés</button>
      <button routerLink="/register">Regisztráció</button>
      <button routerLink="/dashboard">Irányítópult</button>
    </nav>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      padding: 4rem 2rem;
      min-height: 80vh;
      background-color: #f4f8f7;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      text-align: center;
    }

    h1 {
      font-size: 2rem;
      color: #157f74;
      margin-bottom: 2rem;
    }

    nav {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    nav button {
      background-color: #20a190;
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
      min-width: 140px;
    }

    nav button:hover {
      background-color: #16857c;
    }
  `
})
export class HomeComponent {

}
