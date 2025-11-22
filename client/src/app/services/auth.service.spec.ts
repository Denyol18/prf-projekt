import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: {
            navigate: jest.fn()
          }
        }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Mock localStorage
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send POST request on login()', () => {
    const credentials = { email: 'test@example.com', password: '123456' };

    service.login(credentials).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);

    req.flush({ success: true });
  });

  it('should send POST request on register()', () => {
    const userData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: '123456',
      birthDate: '1990-01-01',
      birthPlace: 'City',
      phone: '12345',
      doctorId: 'doc123'
    };

    service.register(userData).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(userData);

    req.flush({ success: true });
  });

  it('should save token to localStorage', () => {
    service.saveToken('abc123');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
  });

  it('should get token from localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('abc123');

    const token = service.getToken();
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
    expect(token).toBe('abc123');
  });

  it('should remove token and navigate on logout()', () => {
    service.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return true when authenticated', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('token123');

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should return false when not authenticated', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    expect(service.isAuthenticated()).toBe(false);
  });
});
