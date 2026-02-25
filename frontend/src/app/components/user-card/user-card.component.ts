//frontend/src/app/components/user-card/user-card.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent {
  // Component data
  name = 'Aanya Sharma';
  role = 'Junior Developer';
  experience = 2;
  skills = ['Angular', 'TypeScript', 'RxJS', 'REST APIs'];
  imageUrl = 'https://via.placeholder.com/150?text=AS';
  
  // State
  isPromoted = false;
  promotionHistory: string[] = [];
  
  // Methods
  promote() {
    // Update role based on current role
    if (this.role === 'Junior Developer') {
      this.role = 'Developer';
      this.experience += 1;
    } else if (this.role === 'Developer') {
      this.role = 'Senior Developer';
      this.experience += 2;
    } else if (this.role === 'Senior Developer') {
      this.role = 'Lead Developer';
      this.experience += 2;
    } else {
      this.role = 'Technical Architect';
      this.experience += 3;
    }
    
    this.isPromoted = true;
    this.addToHistory(`Promoted to ${this.role}`);
    
    // Reset promotion flag after 2 seconds
    setTimeout(() => {
      this.isPromoted = false;
    }, 2000);
  }
  
  addSkill() {
    const newSkills = ['Node.js', 'PostgreSQL', 'Docker', 'Rust', 'GraphQL'];
    const randomSkill = newSkills[Math.floor(Math.random() * newSkills.length)];
    
    if (!this.skills.includes(randomSkill)) {
      this.skills.push(randomSkill);
      this.addToHistory(`Learned ${randomSkill}`);
    }
  }
  
  private addToHistory(event: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.promotionHistory.unshift(`${timestamp}: ${event}`);
    
    // Keep only last 3 events
    if (this.promotionHistory.length > 3) {
      this.promotionHistory.pop();
    }
  }
  
  // Helper for dynamic styling
  getRoleBadgeClass(): string {
    if (this.role.includes('Senior') || this.role.includes('Lead')) {
      return 'role-badge senior';
    } else if (this.role.includes('Technical')) {
      return 'role-badge architect';
    }
    return 'role-badge junior';
  }
}