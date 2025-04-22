import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:3000/api/patients';

  constructor(private http: HttpClient) {}

  getMyPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor`);
  }

  getPatient() :Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  deletePatient(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updatePatient(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
