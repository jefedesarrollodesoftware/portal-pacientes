import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, interval } from 'rxjs';

import { SearchableSelectComponent } from '../../../../shared/components/searchable-select/searchable-select.component';

import { PatientAttributesService } from '../../../patients/services/patient-attributes.service';
import { PatientService } from '../../../patients/services/patient.service';
import {
  PatientAttribute,
  InitiateRegistrationResponse,
} from '../../../patients/models';
import { setBackendErrors } from '../../../patients/utils/form-error-handler';

@Component({
  selector: 'app-sign-form',
  templateUrl: './sign-form.component.html',
  styleUrls: ['./sign-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SearchableSelectComponent
],
})
export class SignFormComponent implements OnInit, OnDestroy {
  currentStep = 1;

  form!: FormGroup;
  codeForm!: FormGroup;

  documentTypes: PatientAttribute[] = [];
  genders: PatientAttribute[] = [];
  genderIdentities: PatientAttribute[] = [];
  civilStatuses: PatientAttribute[] = [];
  scholarships: PatientAttribute[] = [];
  politicalDivisions: PatientAttribute[] = [];
  residenceZones: PatientAttribute[] = [];

  checking = false;
  submitting = false;
  confirming = false;
  sessionData: InitiateRegistrationResponse | null = null;
  errorMessage = '';
  remainingTime = '';
  sessionExpired = false;
  private timerSubscription?: Subscription;

  constructor(
    private patientAttributesService: PatientAttributesService,
    private patientService: PatientService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.buildCodeForm();
    this.loadDocumentTypes();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.sessionExpired = false;
    const expiresAt = new Date(this.sessionData!.expires_at).getTime();

    this.timerSubscription = interval(1000).subscribe(() => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        this.remainingTime = '00:00';
        this.sessionExpired = true;
        this.errorMessage = 'La sesión ha expirado. Debes iniciar el registro nuevamente.';
        this.stopTimer();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      this.remainingTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    });
  }

  private stopTimer(): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
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
        document_expedition_date: new FormControl(''),
        date_birth: new FormControl(''),
        gender_code: new FormControl(''),
        gender_identity_code: new FormControl(''),
        civil_status_code: new FormControl(''),
        scholarship_code: new FormControl(''),
        political_division_code: new FormControl(''),
        residence_zone_code: new FormControl(''),
        address: new FormControl('', { validators: [Validators.maxLength(300)] }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
        password_confirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  private buildCodeForm(): void {
    this.codeForm = new FormGroup({
      email_code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)] }),
      cellphone_code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)] }),
    });
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

  private loadDocumentTypes(): void {
    this.patientAttributesService.getByType('tipo-documento').subscribe({
      next: (res) => { this.documentTypes = res.data; },
      error: () => {},
    });
  }

  private loadAllCatalogs(): void {
    this.patientAttributesService.getByType('sexo').subscribe({
      next: (res) => { this.genders = res.data; },
      error: () => {},
    });

    this.patientAttributesService.getByType('genero').subscribe({
      next: (res) => { this.genderIdentities = res.data; },
      error: () => {},
    });

    this.patientAttributesService.getByType('estado-civil').subscribe({
      next: (res) => { this.civilStatuses = res.data; },
      error: () => {},
    });

    this.patientAttributesService.getByType('nivel-escolar').subscribe({
      next: (res) => { this.scholarships = res.data; },
      error: () => {},
    });

    this.patientAttributesService.getByType('division-politica').subscribe({
      next: (res) => { this.politicalDivisions = res.data; },
      error: () => {},
    });

    this.patientAttributesService.getByType('zona-residencia').subscribe({
      next: (res) => { this.residenceZones = res.data; },
      error: () => {},
    });
  }

  checkExistence(): void {
    if (this.form.get('document_type_code')?.invalid || this.form.get('document_number')?.invalid) {
      this.form.get('document_type_code')?.markAsTouched();
      this.form.get('document_number')?.markAsTouched();
      return;
    }

    this.checking = true;
    this.errorMessage = '';

    this.patientService.checkExistence({
      document_type_code: this.form.get('document_type_code')!.value,
      document_number: this.form.get('document_number')!.value,
    }).subscribe({
      next: (res) => {
        this.checking = false;
        if (res.data === null) {
          this.errorMessage = res.message;
          return;
        }
        if (res.data.exists) {
          this.errorMessage = 'El paciente ya se encuentra registrado en el sistema.';
          return;
        }
        this.loadAllCatalogs();
        this.currentStep = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.checking = false;
        this.errorMessage = err.error?.message || 'Error al verificar el documento. Intenta de nuevo.';
      },
    });
  }

  initiateRegistration(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = this.buildPayload();
    this.patientService.register(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.sessionData = res.data;
        this.currentStep = 3;
        this.codeForm.reset();
        this.errorMessage = '';
        this.startTimer();
        this.toastr.success('Códigos de verificación enviados a tu correo y celular.');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        if (err.status === 422 && err.error?.data) {
          setBackendErrors(this.form, err.error.data);
          this.errorMessage = 'Corrige los errores en el formulario.';
        } else {
          this.errorMessage = err.error?.message || 'Error al iniciar el registro. Intenta de nuevo.';
        }
      },
    });
  }

  confirmRegistration(): void {
    if (this.sessionExpired) {
      this.errorMessage = 'La sesión ha expirado. Debes iniciar el registro nuevamente.';
      return;
    }

    if (this.codeForm.invalid || !this.sessionData) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.confirming = true;
    this.errorMessage = '';

    this.patientService.confirmRegistration({
      session_token: this.sessionData.session_token,
      email_code: this.codeForm.value.email_code,
      cellphone_code: this.codeForm.value.cellphone_code,
    }).subscribe({
      next: (res) => {
        this.confirming = false;
        this.toastr.success(res.message || 'Paciente registrado correctamente.');
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.confirming = false;
        if (err.status === 422) {
          this.errorMessage = 'Código inválido o sesión expirada. Solicita un nuevo registro.';
        } else {
          this.errorMessage = err.error?.message || 'Error al confirmar el registro.';
        }
      },
    });
  }

  private buildPayload(): any {
    const raw = this.form.getRawValue();
    const payload: any = {};
    for (const key of Object.keys(raw)) {
      if (raw[key] !== '' && raw[key] !== null && raw[key] !== undefined) {
        payload[key] = raw[key];
      }
    }
    return payload;
  }

  goBack(): void {
    if (this.currentStep > 1) {
      this.errorMessage = '';
      this.currentStep--;
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  hasError(controlName: string, errorName: string): boolean {
    return !!this.form.get(controlName)?.hasError(errorName) && this.isInvalid(controlName);
  }

  isCodeInvalid(controlName: string): boolean {
    const control = this.codeForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  hasCodeError(controlName: string, errorName: string): boolean {
    return !!this.codeForm.get(controlName)?.hasError(errorName) && this.isCodeInvalid(controlName);
  }
}
