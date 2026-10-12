import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientDashboardPage } from './client-dashboard-page';

describe('ClientDashboardPage', () => {
  let component: ClientDashboardPage;
  let fixture: ComponentFixture<ClientDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDashboardPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientDashboardPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
