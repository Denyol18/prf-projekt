import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn(),
      saveToken: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should login and navigate on success', () => {
    authServiceMock.login.mockReturnValue(of({ token: 'abc123' }));

    component.email = 'test@test.com';
    component.password = 'pw';

    component.login();

    expect(authServiceMock.login).toHaveBeenCalled();
    expect(authServiceMock.saveToken).toHaveBeenCalledWith('abc123');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set specific error from server', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => ({ error: { error: 'Invalid!' } }))
    );

    component.login();

    expect(component.errorMessage).toBe('Invalid!');
  });

  it('should fallback to default error', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => ({ error: {} }))
    );

    component.login();

    expect(component.errorMessage).toBe('Bejelentkezési hiba');
  });
});
