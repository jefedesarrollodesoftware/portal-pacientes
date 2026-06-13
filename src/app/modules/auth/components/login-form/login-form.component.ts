import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService, LoginCredentials } from '../../../../shared/services/auth.service';
import { PatientAttributesService } from '../../../patients/services/patient-attributes.service';
import { PatientAttribute } from '../../../patients/models';
import { SearchableSelectComponent } from '../../../../shared/components/searchable-select/searchable-select.component';

export type LoginFormValue = LoginCredentials;

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, SearchableSelectComponent],
})
export class LoginFormComponent implements OnInit {
  @Output() sendLoginForm = new EventEmitter<LoginFormValue>();
  form = new FormGroup({
    document_type_id: new FormControl<number | null>(null, { validators: [Validators.required] }),
    numero_documento: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(45)] }),
    contraseña: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  documentTypes: PatientAttribute[] = [];

  constructor(
    public authService: AuthService,
    private patientAttributesService: PatientAttributesService,
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();
  }

  private loadDocumentTypes(): void {
    this.patientAttributesService.getByType('tipo-documento').subscribe({
      next: (res) => {
        this.documentTypes = res.data;
      },
      error: () => {},
    });
  }

  login(): void {
    if (this.form.valid) {
      this.sendLoginForm.emit(this.form.getRawValue());
    }
  }

  public isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  public hasError(controlName: string, errorName: string): boolean {
    return !!this.form.get(controlName)?.hasError(errorName) && this.isInvalid(controlName);
  }
}
