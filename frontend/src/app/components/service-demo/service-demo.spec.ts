import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDemo } from './service-demo';

describe('ServiceDemo', () => {
  let component: ServiceDemo;
  let fixture: ComponentFixture<ServiceDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
