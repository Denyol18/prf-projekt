import { Component, OnInit } from '@angular/core';
import {MeasurementService, Measurement} from "../../services/measurement.service";
import {PatientService} from "../../services/patient.service";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  imports: [
    FormsModule,
    NgForOf,
    DatePipe,
    DatePipe,
    FormsModule,
    NgIf,
    NgForOf,
    RouterLink
  ],
  template: `
    <h2 *ngIf="!isDoctor">Mért értékeid:</h2>
    <h2 *ngIf="isDoctor">Pácienseid és mért értékeik:</h2>

    <h3 *ngIf="measurements.length === 0 && !isDoctor">Nincs megjeleníthető mérésed!</h3>
    <h3 *ngIf="Object.keys(groupedMeasurements).length === 0 && isDoctor">Nincs megjeleníthető mérés!</h3>
    
    <table *ngIf="measurements.length > 0 && !isDoctor">
      <tr>
        <th>Dátum</th>
        <th>Vérnyomás</th>
        <th>Pulzus</th>
        <th>Súly</th>
        <th>Vércukor</th>
        <th>Műveletek</th>
      </tr>
      <tr *ngFor="let m of measurements">
        <ng-container *ngIf="editMode && selectedMeasurement?._id === m._id; else normalRow">
          <td><input [(ngModel)]="selectedMeasurement.date" type="date" /></td>
          <td><input [(ngModel)]="selectedMeasurement.bloodPressure" type="number" /></td>
          <td><input [(ngModel)]="selectedMeasurement.pulse" type="number" /></td>
          <td><input [(ngModel)]="selectedMeasurement.weight" type="number" /></td>
          <td><input [(ngModel)]="selectedMeasurement.bloodSugar" type="number" /></td>
          <td>
            <button (click)="saveMeasurementEdit()">Mentés</button>
            <button (click)="cancelMeasurementEdit()">Mégse</button>
          </td>
        </ng-container>
        <ng-template #normalRow>
          <td>{{ m.date | date:'yyyy-MM-dd' }}</td>
          <td>{{ m.bloodPressure || '-' }} Hgmm</td>
          <td>{{ m.pulse || '-' }} bpm</td>
          <td>{{ m.weight || '-' }} kg</td>
          <td>{{ m.bloodSugar || '-' }} mmol/L</td>
          <td>
            <button (click)="startMeasurementEdit(m)">Szerkesztés</button>
            <button *ngIf="!isDoctor" (click)="deleteMeasurement(m._id)">Törlés</button>
          </td>
        </ng-template>
      </tr>
    </table>

    <h2 *ngIf="!isDoctor">Mérés hozzáadása:</h2>
    <form *ngIf="!isDoctor" (ngSubmit)="submitMeasurement()">
      <label>Dátum:
        <input type="date" [(ngModel)]="newMeasurement.date" name="date" required #date="ngModel"/>
        <div *ngIf="date.invalid && date.touched" class="error">A dátum megadása kötelező.</div>
      </label>
      <label>Vérnyomás:
        <input type="number" [(ngModel)]="newMeasurement.bloodPressure" name="bloodPressure" />
      </label>
      <label>Pulzus:
        <input type="number" [(ngModel)]="newMeasurement.pulse" name="pulse" />
      </label>
      <label>Súly:
        <input type="number" [(ngModel)]="newMeasurement.weight" name="weight" />
      </label>
      <label>Vércukorszint:
        <input type="number" [(ngModel)]="newMeasurement.bloodSugar" name="bloodSugar" />
      </label>
      <button type="submit" [disabled]="date.invalid">Mentés</button>

      <p *ngIf="errorMessage" style="color:red">{{ errorMessage }}</p>
    </form>

    <div *ngIf="!isDoctor && patient">
      <h2>Adataid:</h2>
      <table>
        <tr>
          <th>Név</th>
          <th>Telefonszám</th>
          <th>Születési hely</th>
          <th>Születési dátum</th>
          <th>Műveletek</th>
        </tr>
        <tr>
          <ng-container *ngIf="editMode && selectedPatient?._id === patient._id; else normalRow">
            <td><input [(ngModel)]="selectedPatient.fullName" type="text" required minlength="3" #name="ngModel" /></td>
            <td *ngIf="name.invalid && name.touched" class="error">Legalább 3 karakter szükséges.</td>
            
            <td><input [(ngModel)]="selectedPatient.phone" type="text" required pattern="^[0-9]{9,15}$" #phone="ngModel" /></td>
            <td *ngIf="phone.invalid && phone.touched" class="error">Adj meg egy érvényes telefonszámot (9-15 számjegy).</td>
            
            <td><input [(ngModel)]="selectedPatient.birthPlace" type="text" required #birthPlace="ngModel" /></td>
            <td *ngIf="birthPlace.invalid && birthPlace.touched" class="error">Kötelező mező.</td>
            
            <td><input [(ngModel)]="selectedPatient.birthDate" type="date" #birthDate="ngModel" /></td>
            <td>
              <button (click)="savePatientEdit()" [disabled]="name.invalid || phone.invalid || birthPlace.invalid">Mentés</button>
              <button (click)="cancelPatientEdit()">Mégse</button>
            </td>
          </ng-container>
          <ng-template #normalRow>
            <td>{{ patient.fullName }}</td>
            <td>{{ patient.phone }}</td>
            <td>{{ patient.birthPlace }}</td>
            <td>{{ patient.birthDate | date:'yyyy-MM-dd' }}</td>
            <td>
              <button (click)="startPatientEdit(patient)">Szerkesztés</button>
              <button *ngIf="!isDoctor" (click)="deletePatient(patient._id)">Profil törlése</button>
            </td>
          </ng-template>
        </tr>
      </table>
    </div>

    <div *ngIf="Object.keys(groupedMeasurements).length > 0 && isDoctor">
      <div *ngFor="let patientName of getPatientNames()">
        <h3>{{ patientName }}</h3>
        <table>
          <tr>
            <th>Dátum</th>
            <th>Vérnyomás</th>
            <th>Pulzus</th>
            <th>Súly</th>
            <th>Vércukor</th>
          </tr>
          <tr *ngFor="let m of groupedMeasurements[patientName]">
            <td>{{ m.date | date:'yyyy-MM-dd' }}</td>
            <td>{{ m.bloodPressure || '-' }} Hgmm</td>
            <td>{{ m.pulse || '-' }} bpm</td>
            <td>{{ m.weight || '-' }} kg</td>
            <td>{{ m.bloodSugar || '-' }} mmol/L</td>
          </tr>
        </table>
      </div>
    </div>

    <h2 *ngIf="isDoctor">Pácienseid adatai:</h2>
    <h3 *ngIf="isDoctor && patients.length === 0">Nincsenek pácienseid!</h3>
    <div *ngIf="isDoctor && patients.length > 0" class="patient-list">
      <table>
        <tr>
          <th>Név</th>
          <th>Email</th>
          <th>Telefonszám</th>
          <th>Születési hely</th>
          <th>Születési dátum</th>
        </tr>
        <tr *ngFor="let p of patients">
          <td>{{ p.fullName }}</td>
          <td>{{ p.userId.email }}</td>
          <td>{{ p.phone }}</td>
          <td>{{ p.birthPlace }}</td>
          <td>{{ p.birthDate | date:'yyyy-MM-dd' }}</td>
        </tr>
      </table>
    </div>
    
    <nav>
      <button routerLink="">Kezdőlap</button>
      <button (click)="logout()">Kijelentkezés</button>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f8f7;
      color: #2c3e50;
    }

    h2, h3 {
      color: #157f74;
      margin-bottom: 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
      background-color: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      border-radius: 6px;
      overflow: hidden;
    }

    th, td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e1eaea;
      text-align: left;
    }

    th {
      background-color: #e7f3f1;
      color: #2c3e50;
      font-weight: 600;
    }

    tr:last-child td {
      border-bottom: none;
    }

    input[type="text"],
    input[type="number"],
    input[type="date"] {
      width: 100%;
      padding: 0.5rem;
      margin-top: 4px;
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    form {
      background-color: #fff;
      padding: 1.5rem;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      max-width: 500px;
      margin-top: 2rem;
    }

    label {
      display: block;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    button {
      background-color: #20a190;
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    }

    button:hover {
      background-color: #16857c;
    }

    button:disabled {
      background-color: #b0c4c4;
      cursor: not-allowed;
    }

    nav, p {
      margin-top: 2rem;
    }

    nav button,
    p button {
      background-color: #34495e;
    }

    nav button:hover,
    p button:hover {
      background-color: #2c3e50;
    }

    .error {
      color: red;
      font-size: 0.875rem;
    }
  `
})
export class DashboardComponent implements OnInit {
  measurements: any[] = [];
  newMeasurement: Partial<Measurement> = {};
  selectedMeasurement: any = null;
  groupedMeasurements: { [patientName: string]: any[] } = {};

  patients: any[] = [];
  patient: any;
  selectedPatient: any = null;

  isDoctor = false;
  editMode: boolean = false;
  errorMessage = '';


  constructor(private measurementService: MeasurementService, private authService: AuthService,
              private patientService: PatientService ) {}

  private groupMeasurementsByPatient(measurements: any[]) {
    this.groupedMeasurements = {};
    for (const m of measurements) {
      const patientName = m.patientId?.fullName;
      if (!this.groupedMeasurements[patientName]) {
        this.groupedMeasurements[patientName] = [];
      }
      this.groupedMeasurements[patientName].push(m);
    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.isDoctor = payload.role === 'doctor';
    }

    if (this.isDoctor) {
      this.measurementService.getMeasurementsForDoctor().subscribe({
        next: (data) => {
          this.measurements = data;
          this.groupMeasurementsByPatient(data);
        },
        error: (err) => {
          console.error('Nem sikerült lekérni a méréseket az orvos számára:', err);
        }
      });
      this.patientService.getMyPatients().subscribe((data) => {
        this.patients = data;
      });
    } else {
      this.loadMeasurements();
      this.loadPatient();
    }
  }

  loadMeasurements(): void {
    this.measurementService.getMyMeasurements().subscribe({
      next: (data) => (this.measurements = data),
      error: (err) => console.error('Hiba a lekérés során:', err)
    });
  }

  loadPatient(): void {
    this.patientService.getPatient().subscribe({
      next: (data) => (this.patient = data),
      error: (err) => console.error('Hiba a lekérés során:', err)
    });
  }

  submitMeasurement(): void {
    this.measurementService.addMeasurement(this.newMeasurement).subscribe({
      next: () => {
        this.newMeasurement = {};
        this.loadMeasurements();
        this.errorMessage = ''
      },
      error: (err) => this.errorMessage = err.error.error || 'Hiba történt'
    });
  }

  deleteMeasurement(id: string) {
    if (confirm('Biztosan törölni szeretnéd ezt a mérést?')) {
      this.measurementService.deleteMeasurement(id).subscribe({
        next: () => {
          this.measurements = this.measurements.filter(m => m._id !== id);
          this.groupMeasurementsByPatient(this.measurements);
        },
        error: (err) => console.error('Törlés sikertelen:', err)
      });
    }
  }

  deletePatient(id: string) {
    if (confirm('Biztosan törölni szeretnéd a profilod?')) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.logout();
        },
        error: (err) => console.error('Törlés sikertelen:', err)
      });
    }
  }

  startMeasurementEdit(measurement: any) {
    this.editMode = true;
    this.selectedMeasurement = { ...measurement };
  }

  startPatientEdit(patient: any) {
    this.editMode = true;
    this.selectedPatient = { ...patient };
  }

  cancelMeasurementEdit() {
    this.editMode = false;
    this.selectedMeasurement = null;
  }

  cancelPatientEdit() {
    this.editMode = false;
    this.selectedPatient = null;
  }

  saveMeasurementEdit() {
    this.measurementService.updateMeasurement(this.selectedMeasurement._id, this.selectedMeasurement)
        .subscribe({
          next: (updated: any) => {
            const index = this.measurements.findIndex(m => m._id === updated._id);
            if (index > -1) this.measurements[index] = updated;
            this.groupMeasurementsByPatient(this.measurements);
            this.editMode = false;
            this.selectedMeasurement = null;
          },
          error: (err) => console.error('Hiba a mentésnél:', err)
        });
  }

  savePatientEdit() {
    this.patientService.updatePatient(this.selectedPatient._id, this.selectedPatient)
        .subscribe({
          next: (updated: any) => {
            this.patient = updated;
            this.editMode = false;
            this.selectedMeasurement = null;
          },
          error: (err) => console.error('Hiba a mentésnél:', err)
        });
  }

  getPatientNames(): string[] {
    return Object.keys(this.groupedMeasurements);
  }

  logout() {
    this.authService.logout()
  }

  protected readonly Object = Object;
}
