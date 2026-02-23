import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-toast.component.html',
  styleUrls: ['./success-toast.component.css']
})
export class SuccessToastComponent implements OnInit {
  @Input() message: string = 'Operation successful!';
  @Input() duration: number = 3000;
  
  visible = false;

  ngOnInit() {
    this.show();
  }

  show() {
    this.visible = true;
    setTimeout(() => {
      this.visible = false;
    }, this.duration);
  }
}