import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightSearch',
  standalone: true,
})
export class HighlightSearchPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined, query: string | null | undefined): SafeHtml {
    const text = value ?? '';
    const term = (query ?? '').trim();

    if (!text || !term) {
      return text;
    }

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const highlighted = text.replace(regex, '<mark class="search-highlight">$1</mark>');

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
