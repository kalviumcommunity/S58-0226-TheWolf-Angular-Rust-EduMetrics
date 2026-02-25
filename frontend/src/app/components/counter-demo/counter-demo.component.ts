//frontend/src/app/components/counter-demo/counter-demo.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-counter-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './counter-demo.component.html',
  styleUrls: ['./counter-demo.component.css']
})
export class CounterDemoComponent {
  // Reactive state
  count = 0;
  message = 'Click the buttons to see reactive updates!';
  history: string[] = [];

  // Event handler
  increment() {
    this.count++;
    this.updateMessage();
    this.addToHistory('Incremented');
  }

  decrement() {
    this.count--;
    this.updateMessage();
    this.addToHistory('Decremented');
  }

  reset() {
    this.count = 0;
    this.message = 'Counter reset!';
    this.history = [];
  }

  private updateMessage() {
    if (this.count > 10) {
      this.message = '🎉 Count is getting high!';
    } else if (this.count < 0) {
      this.message = '⚠️ Count is negative!';
    } else {
      this.message = 'Keep clicking!';
    }
  }

  private addToHistory(action: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.history.unshift(`${timestamp}: ${action} (Count: ${this.count})`);
    
    // Keep only last 5 items
    if (this.history.length > 5) {
      this.history.pop();
    }
  }
}