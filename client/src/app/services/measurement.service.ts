import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Measurement {
  patientId: string;
  date: Date;
  bloodPressure?: string;
  pulse?: number;
  weight?: number;
  bloodSugar?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private apiUrl = 'http://localhost:3000/api/measurements';

  constructor(private http: HttpClient) {}

  getMyMeasurements(): Observable<Measurement[]> {
    return this.http.get<Measurement[]>(`${this.apiUrl}`);
  }

  getMeasurementsForDoctor(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor`);
  }

  addMeasurement(measurement: Partial<Measurement>): Observable<Measurement> {
    return this.http.post<Measurement>(this.apiUrl, measurement);
  }

  deleteMeasurement(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateMeasurement(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

}
