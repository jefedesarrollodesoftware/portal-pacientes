import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { APP_RUNTIME_CONFIG, AppRuntimeConfig } from '../../../../app.config';
import { AuthService } from '../../../../shared/services/auth.service';
import { PatientAttributesService } from '../../../patients/services/patient-attributes.service';
import { PatientAttribute } from '../../../patients/models';

export type SignFormValue = {
  document_type_code: string;
  document_number: string;
  document_expedition_date: string;
  first_name: string;
  last_name: string;
  date_birth: string;
  gender_code: string;
  civil_status_code: string;
  cellphone: string;
  email: string;
  address: string;
  password: string;
  password_confirmation: string;
  company_id: number;
};

const FALLBACK_DOC_TYPES: PatientAttribute[] = [
  { id: 1, code: 'CC', name: 'Cédula de Ciudadanía', short: 'CC', value: 'CC', description: 'Documento de identidad colombiano', order: 1, icon: null },
  { id: 2, code: 'CE', name: 'Cédula de Extranjería', short: 'CE', value: 'CE', description: null, order: 2, icon: null },
  { id: 3, code: 'NIT', name: 'NIT', short: 'NIT', value: 'NIT', description: null, order: 3, icon: null },
  { id: 4, code: 'PPT', name: 'Permiso por Protección Temporal', short: 'PPT', value: 'PPT', description: null, order: 4, icon: null },
  { id: 5, code: 'Pasaporte', name: 'Pasaporte', short: 'Pasaporte', value: 'Pasaporte', description: null, order: 5, icon: null },
];

const FALLBACK_GENDERS: PatientAttribute[] = [
  { id: 1, code: 'M', name: 'Masculino', short: 'M', value: 'M', description: null, order: 1, icon: null },
  { id: 2, code: 'F', name: 'Femenino', short: 'F', value: 'F', description: null, order: 2, icon: null },
];

const FALLBACK_CIVIL_STATUSES: PatientAttribute[] = [
  { id: 1, code: 'S', name: 'Soltero/a', short: 'S', value: 'S', description: null, order: 1, icon: null },
  { id: 2, code: 'C', name: 'Casado/a', short: 'C', value: 'C', description: null, order: 2, icon: null },
  { id: 3, code: 'D', name: 'Divorciado/a', short: 'D', value: 'D', description: null, order: 3, icon: null },
  { id: 4, code: 'V', name: 'Viudo/a', short: 'V', value: 'V', description: null, order: 4, icon: null },
  { id: 5, code: 'U', name: 'Unión Libre', short: 'U', value: 'U', description: null, order: 5, icon: null },
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class SignFormComponent implements OnInit {
  form!: FormGroup;
  documentTypes: PatientAttribute[] = FALLBACK_DOC_TYPES;
  genders: PatientAttribute[] = FALLBACK_GENDERS;
  civilStatuses: PatientAttribute[] = FALLBACK_CIVIL_STATUSES;
  hidePassword = true;
  hideConfirm = true;
  submitting = false;

  constructor(
    @Inject(APP_RUNTIME_CONFIG) private appConfig: AppRuntimeConfig,
    private patientAttributesService: PatientAttributesService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCatalogs();
  }

  private buildForm(): void {
    this.form = new FormGroup(
      {
        document_type_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        document_number: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(45)] }),
        document_expedition_date: new FormControl('', { nonNullable: true }),
        first_name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        last_name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        date_birth: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        gender_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        civil_status_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        cellphone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        address: new FormControl('', { nonNullable: true }),
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

  private loadCatalogs(): void {
    this.patientAttributesService.getAll().subscribe({
      next: (res) => {
        this.documentTypes = res.data['tipo-documento'] || FALLBACK_DOC_TYPES;
        this.genders = res.data['sexo'] || FALLBACK_GENDERS;
        this.civilStatuses = res.data['estado-civil'] || FALLBACK_CIVIL_STATUSES;
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
      document_expedition_date: raw.document_expedition_date,
      first_name: raw.first_name,
      last_name: raw.last_name,
      date_birth: raw.date_birth,
      gender_code: raw.gender_code,
      civil_status_code: raw.civil_status_code,
      cellphone: raw.cellphone,
      email: raw.email,
      address: raw.address,
      password: raw.password,
      password_confirmation: raw.password_confirmation,
      company_id: this.appConfig.companyId,
    };
    this.sendSignForm.emit(payload);
  }

  @Output() sendSignForm = new EventEmitter<SignFormValue>();
}
