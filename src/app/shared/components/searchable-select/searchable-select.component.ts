import { Component, Input, forwardRef, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-searchable-select',
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true,
    },
  ],
})
export class SearchableSelectComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() options: { code: string; name: string }[] = [];
  @Input() placeholder = 'Seleccione...';
  @Input() invalid = false;
  @Input() disabled = false;

  @ViewChild('dropdownEl') dropdownEl!: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchText = '';
  filteredOptions: { code: string; name: string }[] = [];
  displayValue = '';
  value = '';

  private bsDropdown: any;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    const dropdownEl = this.dropdownEl.nativeElement;
    if (typeof bootstrap !== 'undefined') {
      this.bsDropdown = new bootstrap.Dropdown(dropdownEl, {});
      dropdownEl.addEventListener('hidden.bs.dropdown', () => this.onDropdownClose());
      dropdownEl.addEventListener('shown.bs.dropdown', () => this.onDropdownOpen());
    }
  }

  ngOnDestroy(): void {
    if (this.bsDropdown) {
      this.bsDropdown.dispose();
      this.bsDropdown = null;
    }
  }

  writeValue(value: string): void {
    this.value = value ?? '';
    this.updateDisplay();
  }

  registerOnChange(fn: (value: string) => void): void {
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

  selectOption(option: { code: string; name: string }): void {
    this.value = option.code;
    this.displayValue = option.name;
    this.searchText = '';
    this.filteredOptions = [...this.options];
    this.onChange(this.value);
    this.onTouched();
    this.close();
  }

  isSelected(option: { code: string; name: string }): boolean {
    return this.value === option.code;
  }

  onTriggerClick(): void {
    if (this.disabled) return;
    this.onTouched();
    if (this.bsDropdown) {
      const isShown = this.dropdownEl.nativeElement.classList.contains('show');
      if (isShown) {
        this.bsDropdown.hide();
      } else {
        this.bsDropdown.show();
      }
    }
  }

  private onDropdownOpen(): void {
    this.searchText = '';
    this.filteredOptions = [...this.options];
    setTimeout(() => this.searchInput?.nativeElement?.focus());
  }

  private onDropdownClose(): void {
    this.searchText = '';
    this.filteredOptions = [...this.options];
  }

  private filterOptions(): void {
    const text = this.searchText.toLowerCase();
    this.filteredOptions = this.options.filter(o => o.name.toLowerCase().includes(text));
  }

  private updateDisplay(): void {
    const selected = this.options.find(o => o.code === this.value);
    this.displayValue = selected ? selected.name : '';
  }

  private close(): void {
    if (this.bsDropdown) {
      this.bsDropdown.hide();
    }
  }
}
