import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router, RouterLink} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";


@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    RouterLink
  ],
  template: `
    <div class="register-container">
      <h2>Regisztráció páciensek számára</h2>
      <p>Kérjük, hogy minden mezőt töltsön ki!</p>
      <p>Sikeres regisztrációt követően az oldal átirányítja Önt a bejelentkezés menübe.</p>
      <form #form="ngForm" (submit)="register(); $event.preventDefault()">
        <label>Név</label>
        <input type="text" [(ngModel)]="user.fullName" name="name" required minlength="3" #name="ngModel" />
        <div *ngIf="name.invalid && name.touched" class="error">Legalább 3 karakter szükséges.</div>
  
        <label>Email</label>
        <input type="email" [(ngModel)]="user.email" name="email" required email #email="ngModel" />
        <div *ngIf="email.invalid && email.touched" class="error">Érvényes email cím szükséges.</div>
  
        <label>Jelszó</label>
        <input type="password" [(ngModel)]="user.password" name="password" required minlength="6" #password="ngModel" />
        <div *ngIf="password.invalid && password.touched" class="error">A jelszónak legalább 6 karakterből kell állnia.</div>
  
        <label>Születési dátum</label>
        <input type="date" [(ngModel)]="user.birthDate" name="birthDate" required #birthDate="ngModel" />
        <div *ngIf="birthDate.invalid && birthDate.touched" class="error">Kötelező mező.</div>
  
        <label>Születési hely</label>
        <input type="text" [(ngModel)]="user.birthPlace" name="birthPlace" required #birthPlace="ngModel" />
        <div *ngIf="birthPlace.invalid && birthPlace.touched" class="error">Kötelező mező.</div>
  
        <label>Telefonszám</label>
        <input type="text" [(ngModel)]="user.phone" name="phone" required pattern="^[0-9]{9,15}$" #phone="ngModel" />
        <div *ngIf="phone.invalid && phone.touched" class="error">Adj meg egy érvényes telefonszámot (9-15 számjegy).</div>
        
        <label>Orvos kiválasztása</label>
        <select [(ngModel)]="user.doctorId" name="doctorId" required #doctorId="ngModel">
          <option value="" disabled selected>Válassz orvost</option>
          <option *ngFor="let doc of doctors" [value]="doc._id">{{ doc.fullName }}</option>
        </select>
        <div *ngIf="doctorId.invalid && doctorId.touched" class="error">Válassz egy orvost!</div>

        <button type="submit" [disabled]="form.invalid">Regisztráció</button>
  
        <p *ngIf="errorMessage" style="color:red">{{ errorMessage }}</p>
      </form>
    </div>

    <p>
      <button routerLink="/login">Bejelentkezés</button>
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

    .register-container {
      background-color: #ffffff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
      width: 100%;
      max-width: 500px;
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

    form input,
    form select {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 1.25rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 1rem;
    }

    .error {
      color: red;
      font-size: 0.875rem;
      margin-top: -1rem;
      margin-bottom: 1rem;
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

    button[type="submit"]:disabled {
      background-color: #b0c4c4;
      cursor: not-allowed;
    }

    p[ng-reflect-ng-if] {
      color: #e74c3c;
      margin-top: 0.5rem;
      font-weight: 500;
      text-align: center;
    }

    p {
      margin-top: 1.5rem;
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
  `
})
export class RegisterComponent implements OnInit {
  user = {
    fullName: '',
    email: '',
    password: '',
    birthDate: '',
    birthPlace: '',
    phone: '',
    doctorId: ''
  };

  doctors: any[] = [];
  errorMessage = '';

  constructor(
      private authService: AuthService,
      private router: Router,
      private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/api/doctors')
        .subscribe({
          next: (doctors) => {
            this.doctors = doctors;
          },
          error: (err) => {
            console.error('Hiba az orvosok lekérdezésénél:', err);
          }
        });
  }

  register(): void {
    this.authService.register(this.user).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => this.errorMessage = err.error.error || 'Hiba történt'
    });
  }
}
