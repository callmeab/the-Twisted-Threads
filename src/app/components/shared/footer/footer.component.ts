import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  emailInput = '';
  isSubscribed = signal<boolean>(false);

  onSubscribe(event: Event) {
    event.preventDefault();
    if (this.emailInput.trim()) {
      this.isSubscribed.set(true);
      this.emailInput = '';
      // Reset subscription notice after 5 seconds
      setTimeout(() => {
        this.isSubscribed.set(false);
      }, 5000);
    }
  }
}
