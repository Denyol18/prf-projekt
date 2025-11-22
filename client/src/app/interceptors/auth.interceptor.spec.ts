import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler, HttpRequest } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

describe('AuthInterceptor', () => {
  let authServiceMock: { getToken: jest.Mock };
  let interceptor: ReturnType<typeof AuthInterceptor>;

  beforeEach(() => {
    authServiceMock = { getToken: jest.fn() };
    
    const next = {
      handle: jest.fn((req: HttpRequest<any>) => of(req))
    };

    interceptor = (req: HttpRequest<any>, nextFn = next.handle) => {
      const authService = { getToken: authServiceMock.getToken } as AuthService;
      const token = authService.getToken();
      if (token) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return nextFn(authReq);
      }
      return nextFn(req);
    };
  });

  it('should add Authorization header when token exists', (done) => {
    authServiceMock.getToken.mockReturnValue('abc123');

    const testReq = new HttpRequest('GET', '/test');

    interceptor(testReq).subscribe((req: HttpRequest<any>) => {
      expect(req.headers.has('Authorization')).toBe(true);
      expect(req.headers.get('Authorization')).toBe('Bearer abc123');
      done();
    });
  });

  it('should not add Authorization header when no token', (done) => {
    authServiceMock.getToken.mockReturnValue(null);

    const testReq = new HttpRequest('GET', '/test');

    interceptor(testReq).subscribe((req: HttpRequest<any>) => {
      expect(req.headers.has('Authorization')).toBe(false);
      done();
    });
  });
});
