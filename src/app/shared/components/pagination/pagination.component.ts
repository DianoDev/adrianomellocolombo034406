import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <nav class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-6">
      <div class="-mt-px flex w-0 flex-1">
        @if (currentPage() > 0) {
          <button
            (click)="onPageChange(currentPage() - 1)"
            class="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer"
          >
            <svg class="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clip-rule="evenodd" />
            </svg>
            Anterior
          </button>
        }
      </div>
      <div class="hidden md:-mt-px md:flex">
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">...</span>
          } @else {
            <button
              (click)="onPageChange(page)"
              [class]="page === currentPage()
                ? 'inline-flex items-center border-t-2 border-indigo-500 px-4 pt-4 text-sm font-medium text-indigo-600 cursor-pointer'
                : 'inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer'"
            >
              {{ page + 1 }}
            </button>
          }
        }
      </div>
      <div class="-mt-px flex w-0 flex-1 justify-end">
        @if (currentPage() < totalPages() - 1) {
          <button
            (click)="onPageChange(currentPage() + 1)"
            class="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer"
          >
            Próxima
            <svg class="ml-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clip-rule="evenodd" />
            </svg>
          </button>
        }
      </div>
    </nav>
    <div class="mt-2 text-center text-sm text-gray-500">
      Página {{ currentPage() + 1 }} de {{ totalPages() }} ({{ total() }} itens)
    </div>
  `
})
export class PaginationComponent {
  @Input() set page(value: number) { this._page.set(value); }
  @Input() set pageCount(value: number) { this._pageCount.set(value); }
  @Input() set totalItems(value: number) { this._total.set(value); }
  @Output() pageChange = new EventEmitter<number>();

  private _page = signal(0);
  private _pageCount = signal(1);
  private _total = signal(0);

  currentPage = computed(() => this._page());
  totalPages = computed(() => this._pageCount());
  total = computed(() => this._total());

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);
      if (current > 2) pages.push(-1);

      const start = Math.max(1, current - 1);
      const end = Math.min(total - 2, current + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (current < total - 3) pages.push(-1);
      pages.push(total - 1);
    }

    return pages;
  });

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}
