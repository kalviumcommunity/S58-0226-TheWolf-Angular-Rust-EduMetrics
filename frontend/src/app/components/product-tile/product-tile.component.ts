import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-tile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-tile.component.html',
  styleUrls: ['./product-tile.component.css']
})
export class ProductTileComponent {
  // Component state (data)
  productName = 'Premium Course Access';
  price = 49.99;
  description = 'Get unlimited access to all student analytics features';
  imageUrl = 'https://via.placeholder.com/300x200?text=Course+Access';
  inStock = true;
  
  // Reactive state
  added = false;
  quantity = 1;
  
  // Methods (behavior)
  addToCart() {
    this.added = true;
    console.log(`Added ${this.productName} to cart`);
    
    // Auto-reset after 3 seconds for demo
    setTimeout(() => {
      this.added = false;
    }, 3000);
  }
  
  increaseQuantity() {
    this.quantity++;
  }
  
  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  // Computed property
  getTotalPrice(): number {
    return this.price * this.quantity;
  }
  
  // Dynamic class helper
  getButtonClass(): string {
    return this.added ? 'btn-added' : 'btn-primary';
  }
  
  getButtonText(): string {
    return this.added ? '✓ Added to Cart!' : 'Add to Cart';
  }
}