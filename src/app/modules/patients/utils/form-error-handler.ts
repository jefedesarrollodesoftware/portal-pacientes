import { FormGroup } from '@angular/forms';

export function setBackendErrors(form: FormGroup, errorData: Record<string, string[]>): void {
  Object.keys(errorData).forEach((field) => {
    const control = form.get(field);
    if (control) {
      control.setErrors({ backend: errorData[field].join('. ') });
    }
  });
}
