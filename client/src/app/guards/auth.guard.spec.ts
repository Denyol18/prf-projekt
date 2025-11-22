import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: jest.Mocked<AuthService>;
  let router: Router;

  beforeEach(() => {
    const mockAuthService: jest.Mocked<AuthService> = {
      isAuthenticated: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceMock = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  it('should allow activation when authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should block activation and redirect when not authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
