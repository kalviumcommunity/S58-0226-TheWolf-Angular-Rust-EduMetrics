//frontend/src/app/components/product-tile/product-tile.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTile } from './product-tile';

describe('ProductTile', () => {
  let component: ProductTile;
  let fixture: ComponentFixture<ProductTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
