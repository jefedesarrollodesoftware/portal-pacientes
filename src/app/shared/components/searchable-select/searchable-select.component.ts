import { Component, Input, forwardRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-searchable-select',
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.scss'],
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true,
    },
  ],
})
export class SearchableSelectComponent implements ControlValueAccessor, OnDestroy {
  @Input() options: { id: number; name: string }[] = [];
  @Input() placeholder = 'Seleccione...';
  @Input() invalid = false;
  @Input() disabled = false;

  @ViewChild('triggerEl', { read: ElementRef }) triggerEl!: ElementRef<HTMLElement>;
  @ViewChild('menuEl', { read: ElementRef }) menuEl!: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchText = '';
  filteredOptions: { id: number; name: string }[] = [];
  displayValue = '';
  value: number | null = null;
  isOpen = false;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private closeHandler: ((event: MouseEvent) => void) | null = null;
  private keyHandler: ((event: KeyboardEvent) => void) | null = null;

  ngOnDestroy(): void {
    this.removeListeners();
  }

  writeValue(value: number | null): void {
    this.value = value ?? null;
    this.updateDisplay();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value;
    this.filterOptions();
  }

  selectOption(option: { id: number; name: string }): void {
    this.value = option.id;
    this.displayValue = option.name;
    this.searchText = '';
    this.filteredOptions = [...this.options];
    this.onChange(this.value);
    this.onTouched();
    this.close();
  }

  isSelected(option: { id: number; name: string }): boolean {
    return this.value === option.id;
  }

  onTriggerClick(): void {
    if (this.disabled) return;
    this.onTouched();
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    const triggerRect = this.triggerEl.nativeElement.getBoundingClientRect();
    const menu = this.menuEl.nativeElement;

    Object.assign(menu.style, {
      position: 'fixed',
      top: `${triggerRect.bottom}px`,
      left: `${triggerRect.left}px`,
      width: `${triggerRect.width}px`,
      margin: '0',
      display: 'block',
    });

    this.isOpen = true;
    this.searchText = '';
    this.filteredOptions = [...this.options];

    this.closeHandler = (event: MouseEvent) => {
      if (!this.menuEl.nativeElement.contains(event.target as Node) &&
          !this.triggerEl.nativeElement.contains(event.target as Node)) {
        this.close();
      }
    };
    document.addEventListener('click', this.closeHandler);

    this.keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this.keyHandler);

    setTimeout(() => this.searchInput?.nativeElement?.focus());
  }

  private close(): void {
    this.removeListeners();
    this.menuEl.nativeElement.style.display = '';
    this.isOpen = false;
    this.searchText = '';
    this.filteredOptions = [...this.options];
  }

  private removeListeners(): void {
    if (this.closeHandler) {
      document.removeEventListener('click', this.closeHandler);
      this.closeHandler = null;
    }
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  private filterOptions(): void {
    const text = this.searchText.toLowerCase();
    this.filteredOptions = this.options.filter(o => o.name.toLowerCase().includes(text));
  }

  private updateDisplay(): void {
    const selected = this.options.find(o => o.id === this.value);
    this.displayValue = selected ? selected.name : '';
  }
}
