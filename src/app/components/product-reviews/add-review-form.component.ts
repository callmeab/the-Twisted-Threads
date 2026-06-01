import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { StarRatingComponent } from '../shared/star-rating/star-rating.component';

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function emailValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) {
    return { required: true };
  }
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return valid ? null : { email: true };
}

@Component({
  selector: 'app-add-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StarRatingComponent],
  templateUrl: './add-review-form.component.html',
  styleUrl: './add-review-form.component.scss',
})
export class AddReviewFormComponent {
  public readonly productId = input.required<string>();

  public readonly submitted = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly reviewService = inject(ReviewService);

  protected readonly rating = signal(0);
  protected readonly imagePreviews = signal<string[]>([]);
  protected readonly submitSuccess = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitAttempted = signal(false);

  protected readonly form = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    customerEmail: ['', [emailValidator]],
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    comment: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
  });

  protected onRatingChange(value: number): void {
    this.rating.set(value);
  }

  protected async onImagesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) {
      return;
    }

    const current = this.imagePreviews();
    const remaining = MAX_IMAGES - current.length;
    if (remaining <= 0) {
      input.value = '';
      return;
    }

    const toAdd = Array.from(files).slice(0, remaining);
    const newPreviews: string[] = [];

    for (const file of toAdd) {
      if (!file.type.startsWith('image/')) {
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        continue;
      }
      const dataUrl = await this.readFileAsDataUrl(file);
      newPreviews.push(dataUrl);
    }

    this.imagePreviews.update(list => [...list, ...newPreviews].slice(0, MAX_IMAGES));
    input.value = '';
  }

  protected removeImage(index: number): void {
    this.imagePreviews.update(list => list.filter((_, i) => i !== index));
  }

  protected onSubmit(): void {
    this.submitAttempted.set(true);
    this.form.markAllAsTouched();

    if (this.rating() < 1 || this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();

    this.reviewService.submitReview({
      productId: this.productId(),
      customerName: raw.customerName!,
      customerEmail: raw.customerEmail!,
      rating: this.rating(),
      title: raw.title!,
      comment: raw.comment!,
      images: this.imagePreviews(),
    });

    this.isSubmitting.set(false);
    this.submitSuccess.set(true);
    this.form.reset();
    this.rating.set(0);
    this.imagePreviews.set([]);
    this.submitted.emit();
  }

  protected showError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected ratingError(): boolean {
    return this.rating() < 1 && this.submitAttempted();
  }

  protected fieldErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control?.errors) {
      return '';
    }
    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['email']) {
      return 'Enter a valid email address.';
    }
    if (control.errors['minlength']) {
      const min = control.errors['minlength'].requiredLength;
      return `Minimum ${min} characters required.`;
    }
    if (control.errors['maxlength']) {
      return 'Maximum length exceeded.';
    }
    return 'Invalid value.';
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
