import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiDemo } from './api-demo';

describe('ApiDemo', () => {
  let component: ApiDemo;
  let fixture: ComponentFixture<ApiDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
