//frontend/src/app/components/error-alert/error-alert.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-alert.component.html',
  styleUrls: ['./error-alert.component.css']
})
export class ErrorAlertComponent {
  @Input() errorMessage: string = '';
  @Input() errorCode: string = '';
  @Input() dismissible: boolean = true;
  @Output() dismiss = new EventEmitter<void>();

  onDismiss() {
    this.dismiss.emit();
  }

  getErrorIcon(): string {
    if (this.errorCode.includes('401') || this.errorCode.includes('403')) {
      return '🔒';
    } else if (this.errorCode.includes('404')) {
      return '🔍';
    } else if (this.errorCode.includes('500')) {
      return '⚠️';
    } else if (this.errorCode.includes('NETWORK')) {
      return '📡';
    }
    return '❌';
  }

  getErrorTitle(): string {
    if (this.errorCode.includes('401') || this.errorCode.includes('403')) {
      return 'Authentication Error';
    } else if (this.errorCode.includes('404')) {
      return 'Not Found';
    } else if (this.errorCode.includes('500')) {
      return 'Server Error';
    } else if (this.errorCode.includes('NETWORK')) {
      return 'Network Error';
    }
    return 'Error';
  }
}