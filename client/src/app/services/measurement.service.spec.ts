import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MeasurementService, Measurement } from './measurement.service';

describe('MeasurementService', () => {
  let service: MeasurementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MeasurementService]
    });

    service = TestBed.inject(MeasurementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve my measurements', () => {
    const mockMeasurements: Measurement[] = [
      { patientId: 'p1', date: new Date(), weight: 70 },
      { patientId: 'p2', date: new Date(), bloodPressure: '120/80' }
    ];

    service.getMyMeasurements().subscribe((data) => {
      expect(data).toEqual(mockMeasurements);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/measurements');
    expect(req.request.method).toBe('GET');
    req.flush(mockMeasurements);
  });

  it('should retrieve measurements for doctor', () => {
    const mockMeasurements = [{ patientId: 'p1', date: new Date(), pulse: 70 }];

    service.getMeasurementsForDoctor().subscribe((data) => {
      expect(data).toEqual(mockMeasurements);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/measurements/doctor');
    expect(req.request.method).toBe('GET');
    req.flush(mockMeasurements);
  });

  it('should add a measurement', () => {
    const newMeasurement: Partial<Measurement> = { patientId: 'p3', weight: 75 };
    const returnedMeasurement: Measurement = { ...newMeasurement, date: new Date() } as Measurement;

    service.addMeasurement(newMeasurement).subscribe((data) => {
      expect(data).toEqual(returnedMeasurement);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/measurements');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newMeasurement);
    req.flush(returnedMeasurement);
  });

  it('should delete a measurement', () => {
    const id = 'measurement123';

    service.deleteMeasurement(id).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/measurements/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('should update a measurement', () => {
    const id = 'measurement456';
    const updateData = { weight: 80 };

    service.updateMeasurement(id, updateData).subscribe((res) => {
      expect(res).toEqual({ ...updateData });
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/measurements/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush({ ...updateData });
  });
});
