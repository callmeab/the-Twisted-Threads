import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  protected contactData = {
    fullName: '',
    email: '',
    subject: '',
    message: '',
  };

  protected onSubmit(isValid: boolean | null): void {
    if (isValid) {
      this.toastr.success('Your message has been registered. Our concierge will contact you shortly.', 'Inquiry Dispatched');
      this.contactData = {
        fullName: '',
        email: '',
        subject: '',
        message: '',
      };
      this.router.navigate(['/']);
    }
  }
}
