import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../shared/services/auth.service';
import { PatientAttributesService } from '../../../patients/services/patient-attributes.service';
import { PatientAttribute, RegisterPatientRequest } from '../../../patients/models';

export type SignFormValue = RegisterPatientRequest;

const FALLBACK_DOC_TYPES: PatientAttribute[] = [
  { id: 1, code: 'CC', name: 'Cédula de Ciudadanía', short: 'CC', value: 'CC', description: 'Documento de identidad colombiano', order: 1, icon: null },
  { id: 2, code: 'CE', name: 'Cédula de Extranjería', short: 'CE', value: 'CE', description: null, order: 2, icon: null },
  { id: 3, code: 'NIT', name: 'NIT', short: 'NIT', value: 'NIT', description: null, order: 3, icon: null },
  { id: 4, code: 'PPT', name: 'Permiso por Protección Temporal', short: 'PPT', value: 'PPT', description: null, order: 4, icon: null },
  { id: 5, code: 'Pasaporte', name: 'Pasaporte', short: 'Pasaporte', value: 'Pasaporte', description: null, order: 5, icon: null },
];

@Component({
  selector: 'app-sign-form',
  templateUrl: './sign-form.component.html',
  styleUrls: ['./sign-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class SignFormComponent implements OnInit {
  form!: FormGroup;
  documentTypes: PatientAttribute[] = FALLBACK_DOC_TYPES;
  hidePassword = true;
  hideConfirm = true;
  submitting = false;

  constructor(
    private patientAttributesService: PatientAttributesService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDocumentTypes();
  }

  private buildForm(): void {
    this.form = new FormGroup(
      {
        document_type_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        document_number: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(45)] }),
        email: new FormControl('', { nonNullable: false, validators: [Validators.email] }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
        password_confirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  private passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmation = control.get('password_confirmation')?.value;
    if (password && confirmation && password !== confirmation) {
      control.get('password_confirmation')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  };

  private loadDocumentTypes(): void {
    this.patientAttributesService.getAll().subscribe({
      next: (res) => {
        this.documentTypes = res.data['tipo-documento'] || FALLBACK_DOC_TYPES;
      },
      error: () => {},
    });
  }

  register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const raw = this.form.getRawValue();
    const payload: SignFormValue = {
      document_type_code: raw.document_type_code,
      document_number: raw.document_number,
      email: raw.email || undefined,
      password: raw.password,
      password_confirmation: raw.password_confirmation,
    };
    this.sendSignForm.emit(payload);
  }

  @Output() sendSignForm = new EventEmitter<SignFormValue>();
}
