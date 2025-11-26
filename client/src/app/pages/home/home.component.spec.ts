import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HomeComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the heading text', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent.trim()).toBe('Üdvözöllek az Egészségügyi Adatkezelőben!');
  });

  it('should have three navigation buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('nav button');
    expect(buttons.length).toBe(3);
  });

  it('should have correct routerLink bindings', () => {
    const buttons = fixture.debugElement.queryAll(By.css('nav button'));

    expect(buttons[0].attributes['ng-reflect-router-link']).toBe('/login');
    expect(buttons[1].attributes['ng-reflect-router-link']).toBe('/register');
    expect(buttons[2].attributes['ng-reflect-router-link']).toBe('/dashboard');
  });
});
