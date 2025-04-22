import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from "../../services/auth.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    NgIf,
    RouterLink
  ],
  template: `
    <div class="login-container">
      <h2>Bejelentkezés</h2>
      <form (submit)="login(); $event.preventDefault()">
        <label>Email</label>
        <input type="email" [(ngModel)]="email" name="email" required />

        <label>Jelszó</label>
        <input type="password" [(ngModel)]="password" name="password" required />

        <button type="submit">Belépés</button>
      </form>

      <p *ngIf="errorMessage" style="color: red">{{ errorMessage }}</p>
    </div>
    <p>
      <button routerLink="/register">Regisztráció</button>
      <button routerLink="">Kezdőlap</button>
    </p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f8f7;
      min-height: 100vh;
    }

    .login-container {
      background-color: #ffffff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      color: #157f74;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    form label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 500;
      color: #2c3e50;
    }

    form input {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 1.25rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 1rem;
    }

    button[type="submit"] {
      width: 100%;
      background-color: #20a190;
      color: white;
      border: none;
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    }

    button[type="submit"]:hover {
      background-color: #16857c;
    }

    p {
      margin-top: 1rem;
      text-align: center;
    }

    p button {
      margin: 0 0.25rem;
      padding: 0.5rem 1rem;
      background-color: #34495e;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    p button:hover {
      background-color: #2c3e50;
    }

    p[ng-reflect-ng-if] {
      color: #e74c3c;
      margin-top: 0.5rem;
      font-weight: 500;
    }
  `
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Bejelentkezési hiba';
      }
    });
  }
}
