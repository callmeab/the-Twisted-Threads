import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FAQ_CATEGORIES } from '../../data/faq.data';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject(ElementRef<HTMLElement>);

  private revealObserver?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;

  protected readonly categories = FAQ_CATEGORIES;
  protected readonly searchQuery = signal('');
  protected readonly expandedIds = signal<Set<string>>(new Set());
  protected readonly activeCategoryId = signal<string>(FAQ_CATEGORIES[0].id);

  protected readonly filteredCategories = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.categories;
    }

    return this.categories
      .map(category => ({
        ...category,
        questions: category.questions.filter(
          item =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        ),
      }))
      .filter(category => category.questions.length > 0);
  });

  protected readonly totalVisibleQuestions = computed(() =>
    this.filteredCategories().reduce((sum, cat) => sum + cat.questions.length, 0)
  );

  protected readonly allExpanded = computed(() => {
    const visible = this.getAllVisibleQuestionIds();
    const expanded = this.expandedIds();
    return visible.length > 0 && visible.every(id => expanded.has(id));
  });

  protected readonly hasSearchResults = computed(() => this.totalVisibleQuestions() > 0);

  public ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    Array.from(this.host.nativeElement.querySelectorAll('.reveal') as NodeListOf<Element>).forEach(el =>
      this.revealObserver?.observe(el)
    );

    this.sectionObserver = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.getAttribute('data-category-id');
        if (id) {
          this.activeCategoryId.set(id);
        }
      },
      { threshold: [0.15, 0.35, 0.5], rootMargin: '-20% 0px -55% 0px' }
    );

    Array.from(
      this.host.nativeElement.querySelectorAll('.faq-category-section') as NodeListOf<Element>
    ).forEach(el => this.sectionObserver?.observe(el));
  }

  public ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.sectionObserver?.disconnect();
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
    if (!value.trim()) {
      return;
    }
    const ids = this.getAllVisibleQuestionIds();
    if (ids.length <= 3) {
      this.expandedIds.set(new Set(ids));
    }
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
  }

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected toggleQuestion(id: string): void {
    const next = new Set(this.expandedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.expandedIds.set(next);
  }

  protected expandOrCollapseAll(): void {
    if (this.allExpanded()) {
      this.expandedIds.set(new Set());
      return;
    }
    this.expandedIds.set(new Set(this.getAllVisibleQuestionIds()));
  }

  protected scrollToCategory(categoryId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.activeCategoryId.set(categoryId);
    const el = this.host.nativeElement.querySelector(`#${categoryId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private getAllVisibleQuestionIds(): string[] {
    return this.filteredCategories().flatMap(cat => cat.questions.map(q => q.id));
  }
}
