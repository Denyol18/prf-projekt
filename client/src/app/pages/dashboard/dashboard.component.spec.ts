import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { MeasurementService } from '../../services/measurement.service';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let measurementServiceMock: any;
  let patientServiceMock: any;
  let authServiceMock: any;

  beforeEach(async () => {
    measurementServiceMock = {
      getMyMeasurements: jest.fn().mockReturnValue(of([])),
      getMeasurementsForDoctor: jest.fn().mockReturnValue(of([])),
      addMeasurement: jest.fn().mockReturnValue(of({})),
      updateMeasurement: jest.fn().mockReturnValue(of({})),
      deleteMeasurement: jest.fn().mockReturnValue(of({}))
    };

    patientServiceMock = {
      getPatient: jest.fn().mockReturnValue(of({ fullName: 'John Doe' })),
      getMyPatients: jest.fn().mockReturnValue(of([])),
      updatePatient: jest.fn().mockReturnValue(of({})),
      deletePatient: jest.fn().mockReturnValue(of({}))
    };

    authServiceMock = {
      logout: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        FormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: MeasurementService, useValue: measurementServiceMock },
        { provide: PatientService, useValue: patientServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load measurements and patient for non-doctor', () => {
    const payload = { role: 'user' };
	const fakeToken = `header.${btoa(JSON.stringify(payload))}.signature`;
	localStorage.setItem('token', fakeToken);
    component.ngOnInit();
    expect(measurementServiceMock.getMyMeasurements).toHaveBeenCalled();
    expect(patientServiceMock.getPatient).toHaveBeenCalled();
  });

  it('should handle doctor view', () => {
    const payload = { role: 'doctor' };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem('token', token);
    component.ngOnInit();
    expect(measurementServiceMock.getMeasurementsForDoctor).toHaveBeenCalled();
    expect(patientServiceMock.getMyPatients).toHaveBeenCalled();
  });

  it('should submit a new measurement', () => {
    const newMeasurement = { date: new Date() };
	component.newMeasurement = newMeasurement;
	component.submitMeasurement();
	expect(measurementServiceMock.addMeasurement).toHaveBeenCalledWith(newMeasurement);
  });

  it('should start and cancel measurement edit', () => {
    const measurement = { _id: '123' };
    component.startMeasurementEdit(measurement);
    expect(component.editMode).toBe(true);
    expect(component.selectedMeasurement._id).toBe('123');

    component.cancelMeasurementEdit();
    expect(component.editMode).toBe(false);
    expect(component.selectedMeasurement).toBeNull();
  });

  it('should start and cancel patient edit', () => {
    const patient = { _id: 'p1' };
    component.startPatientEdit(patient);
    expect(component.editMode).toBe(true);
    expect(component.selectedPatient._id).toBe('p1');

    component.cancelPatientEdit();
    expect(component.editMode).toBe(false);
    expect(component.selectedPatient).toBeNull();
  });

  it('should call authService.logout when deleting patient', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    component.patient = { _id: 'p1' };
    component.deletePatient('p1');
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should call authService.logout on logout button', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });
  
  it('should delete measurement when confirmed', () => {
	jest.spyOn(window, 'confirm').mockReturnValue(true);
	const measurement = { _id: '1' };
	component.measurements = [measurement];
	measurementServiceMock.deleteMeasurement.mockReturnValue(of({}));

	component.deleteMeasurement('1');

	expect(component.measurements).toEqual([]);
  });

  it('should not delete measurement when cancelled', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    const measurement = { _id: '1' };
    component.measurements = [measurement];

    component.deleteMeasurement('1');

    expect(component.measurements).toEqual([measurement]);
  });
  
  it('should group measurements by patient name', () => {
	const measurements = [
		{ _id: '1', patientId: { fullName: 'Alice' }, date: new Date() },
		{ _id: '2', patientId: { fullName: 'Bob' }, date: new Date() },
		{ _id: '3', patientId: { fullName: 'Alice' }, date: new Date() }
	];

	(component as any).groupMeasurementsByPatient(measurements);

	expect(component.groupedMeasurements).toEqual({
	  Alice: [
		  { _id: '1', patientId: { fullName: 'Alice' }, date: measurements[0].date },
		  { _id: '3', patientId: { fullName: 'Alice' }, date: measurements[2].date }
	  ],
	  Bob: [
		  { _id: '2', patientId: { fullName: 'Bob' }, date: measurements[1].date }
	   ]
	});
  });
  
  it('should update measurement, update measurements array and reset edit state', () => {
	const selectedMeasurement = { _id: '1', value: 99 };
	component.measurements = [{ _id: '1', value: 0 }];
	component.selectedMeasurement = { ...selectedMeasurement };
	component.editMode = true;

	const updatedMeasurement = { _id: '1', value: 42 };
	measurementServiceMock.updateMeasurement.mockReturnValue(of(updatedMeasurement));
	const spyGroup = jest.spyOn(component as any, 'groupMeasurementsByPatient');

	component.saveMeasurementEdit();

	expect(measurementServiceMock.updateMeasurement).toHaveBeenCalledWith(
	  '1',
	  selectedMeasurement
	);
	expect(component.measurements).toContain(updatedMeasurement);
	expect(spyGroup).toHaveBeenCalledWith(component.measurements);
	expect(component.editMode).toBe(false);
	expect(component.selectedMeasurement).toBeNull();
  });


  it('should log error if measurement update fails', () => {
    const error = { message: 'fail' };
    component.selectedMeasurement = { _id: '1', value: 99 };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    measurementServiceMock.updateMeasurement.mockReturnValue(throwError(() => error));

    component.saveMeasurementEdit();

    expect(console.error).toHaveBeenCalledWith('Hiba a mentésnél:', error);
  });

  it('should update patient and reset edit state', () => {
    const updatedPatient = { _id: 'p1', name: 'Alice' };
    component.selectedPatient = { _id: 'p1', name: 'Alice' };
    component.editMode = true;

    patientServiceMock.updatePatient.mockReturnValue(of(updatedPatient));

    component.savePatientEdit();

    expect(patientServiceMock.updatePatient).toHaveBeenCalledWith(
      'p1',
      component.selectedPatient
    );
    expect(component.patient).toEqual(updatedPatient);
    expect(component.editMode).toBe(false);
    expect(component.selectedMeasurement).toBeNull();
  });

  it('should log error if patient update fails', () => {
    const error = { message: 'fail' };
    component.selectedPatient = { _id: 'p1', name: 'Alice' };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    patientServiceMock.updatePatient.mockReturnValue(throwError(() => error));

    component.savePatientEdit();

    expect(console.error).toHaveBeenCalledWith('Hiba a mentésnél:', error);
  });

  it('should return patient names from groupedMeasurements', () => {
    component.groupedMeasurements = {
      Alice: [],
      Bob: []
    };

    const names = component.getPatientNames();
    expect(names).toEqual(['Alice', 'Bob']);
  });
});
