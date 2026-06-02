import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { PatientAttributesService } from '../../../patients/services/patient-attributes.service';
import { PatientAttribute, RegisterPatientRequest } from '../../../patients/models';

export type SignFormValue = RegisterPatientRequest;

@Component({
  selector: 'app-sign-form',
  templateUrl: './sign-form.component.html',
  styleUrls: ['./sign-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class SignFormComponent implements OnInit {
  form!: FormGroup;
  documentTypes: PatientAttribute[] = [];
  genders: PatientAttribute[] = [];
  civilStatuses: PatientAttribute[] = [];
  submitting = false;

  constructor(
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
        first_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
        last_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
        cellphone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(45)] }),
        cellphone_code: new FormControl('', { validators: [Validators.maxLength(10)] }),
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(191)] }),
        date_birth: new FormControl(''),
        gender_code: new FormControl(''),
        civil_status_code: new FormControl(''),
        address: new FormControl('', { validators: [Validators.maxLength(300)] }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
        password_confirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  private passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const passwordControl = control.get('password');
    const confirmationControl = control.get('password_confirmation');

    if (!passwordControl || !confirmationControl) {
      return null;
    }

    const password = passwordControl.value;
    const confirmation = confirmationControl.value;

    if (!password || !confirmation) {
      return null;
    }

    const hasMismatch = password !== confirmation;
    const existingErrors = confirmationControl.errors ?? {};

    if (hasMismatch) {
      confirmationControl.setErrors({ ...existingErrors, mismatch: true });
      return { mismatch: true };
    }

    if (existingErrors['mismatch']) {
      const { mismatch, ...otherErrors } = existingErrors;
      confirmationControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }

    return null;
  };

  private loadCatalogs(): void {
    this.patientAttributesService.getByType('tipo-documento').subscribe({
      next: (res) => { this.documentTypes = res.data; },
      error: () => {},
    });

    this.patientAttributesService.getByType('sexo').subscribe({
      next: (res) => { this.genders = res.data; },
      error: () => {},
    });

    this.patientAttributesService.getByType('estado-civil').subscribe({
      next: (res) => { this.civilStatuses = res.data; },
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
      first_name: raw.first_name,
      last_name: raw.last_name,
      cellphone: raw.cellphone,
      email: raw.email,
      password: raw.password,
      password_confirmation: raw.password_confirmation,
    };

    if (raw.cellphone_code) payload.cellphone_code = raw.cellphone_code;
    if (raw.date_birth) payload.date_birth = raw.date_birth;
    if (raw.gender_code) payload.gender_code = raw.gender_code;
    if (raw.civil_status_code) payload.civil_status_code = raw.civil_status_code;
    if (raw.address) payload.address = raw.address;

    this.sendSignForm.emit(payload);
  }

  public isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  public hasError(controlName: string, errorName: string): boolean {
    return !!this.form.get(controlName)?.hasError(errorName) && this.isInvalid(controlName);
  }

  @Output() sendSignForm = new EventEmitter<SignFormValue>();
}
