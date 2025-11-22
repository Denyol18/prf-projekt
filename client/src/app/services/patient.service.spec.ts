import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient.service';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });

    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve patients for doctor', () => {
    const mockPatients = [
      { id: 'p1', name: 'John Doe' },
      { id: 'p2', name: 'Jane Smith' }
    ];

    service.getMyPatients().subscribe((data) => {
      expect(data).toEqual(mockPatients);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/patients/doctor');
    expect(req.request.method).toBe('GET');
    req.flush(mockPatients);
  });

  it('should retrieve all patients', () => {
    const mockPatients = [
      { id: 'p1', name: 'John Doe' },
      { id: 'p2', name: 'Jane Smith' }
    ];

    service.getPatient().subscribe((data) => {
      expect(data).toEqual(mockPatients);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/patients');
    expect(req.request.method).toBe('GET');
    req.flush(mockPatients);
  });

  it('should delete a patient', () => {
    const id = 'p123';

    service.deletePatient(id).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/patients/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('should update a patient', () => {
    const id = 'p456';
    const updateData = { name: 'Updated Name' };

    service.updatePatient(id, updateData).subscribe((res) => {
      expect(res).toEqual(updateData);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/patients/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(updateData);
  });
});
