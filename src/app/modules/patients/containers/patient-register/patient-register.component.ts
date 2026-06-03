import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { PatientService } from '../../services/patient.service';
import { PatientAttributesService } from '../../services/patient-attributes.service';
import { PatientAttribute, InitiateRegistrationResponse } from '../../models';
import { setBackendErrors } from '../../utils/form-error-handler';

@Component({
  selector: 'app-patient-register',
  templateUrl: './patient-register.component.html',
  styleUrls: [],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
  ],
})
export class PatientRegisterComponent implements OnInit {
  currentStep = 1;
  registerForm: FormGroup;
  codeForm: FormGroup;
  checking = false;
  submitting = false;
  confirming = false;
  sessionData: InitiateRegistrationResponse | null = null;

  documentTypes: PatientAttribute[] = [];
  genders: PatientAttribute[] = [];
  genderIdentities: PatientAttribute[] = [];
  civilStatuses: PatientAttribute[] = [];
  scholarships: PatientAttribute[] = [];
  politicalDivisions: PatientAttribute[] = [];
  residenceZones: PatientAttribute[] = [];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private patientAttributesService: PatientAttributesService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildCheckForm();
    this.buildCodeForm();
    this.loadDocumentTypes();
  }

  private buildCheckForm(): void {
    this.registerForm = this.fb.group(
      {
        document_type_code: ['', Validators.required],
        document_number: ['', [Validators.required, Validators.maxLength(45)]],
        first_name: ['', [Validators.required, Validators.maxLength(120)]],
        last_name: ['', [Validators.required, Validators.maxLength(120)]],
        cellphone: ['', [Validators.required, Validators.maxLength(45)]],
        cellphone_code: ['', [Validators.maxLength(10)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(191)]],
        document_expedition_date: [''],
        date_birth: [''],
        gender_code: [''],
        gender_identity_code: [''],
        civil_status_code: [''],
        scholarship_code: [''],
        political_division_code: [''],
        residence_zone_code: [''],
        address: ['', Validators.maxLength(300)],
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirmation: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  private buildCodeForm(): void {
    this.codeForm = this.fb.group({
      email_code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      cellphone_code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  private passwordsMatchValidator(group: FormGroup): Record<string, unknown> | null {
    const password = group.get('password')?.value;
    const confirmation = group.get('password_confirmation')?.value;
    if (password && confirmation && password !== confirmation) {
      group.get('password_confirmation')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

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
    if (this.registerForm.get('document_type_code')?.invalid || this.registerForm.get('document_number')?.invalid) {
      this.registerForm.get('document_type_code')?.markAsTouched();
      this.registerForm.get('document_number')?.markAsTouched();
      return;
    }
    this.checking = true;
    this.patientService.checkExistence({
      document_type_code: this.registerForm.get('document_type_code')!.value,
      document_number: this.registerForm.get('document_number')!.value,
    }).subscribe({
      next: (res) => {
        this.checking = false;
        if (res.data === null) {
          this.toastr.error(res.message);
          return;
        }
        if (res.data.exists) {
          this.toastr.error('El paciente ya se encuentra registrado en el sistema.');
          return;
        }
        this.loadAllCatalogs();
        this.currentStep = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.checking = false;
        this.toastr.error(err.error?.message || 'Error al verificar el documento. Intenta de nuevo.');
      },
    });
  }

  initiateRegistration(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = this.buildPayload();
    this.patientService.register(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.sessionData = res.data;
        this.currentStep = 3;
        this.toastr.success('Códigos de verificación enviados a tu correo y celular.');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        if (err.status === 422 && err.error?.data) {
          setBackendErrors(this.registerForm, err.error.data);
          this.toastr.error('Corrige los errores en el formulario.');
        } else if (err.status === 500) {
          this.toastr.error('Error del servidor. Intenta nuevamente.');
        } else {
          this.toastr.error(err.error?.message || 'Ocurrió un error inesperado.');
        }
      },
    });
  }

  confirmRegistration(): void {
    if (this.codeForm.invalid || !this.sessionData) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.confirming = true;
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
          this.toastr.error('Código inválido o sesión expirada. Solicita un nuevo registro.');
        } else {
          this.toastr.error(err.error?.message || 'Error al confirmar el registro.');
        }
      },
    });
  }

  private buildPayload(): any {
    const raw = this.registerForm.getRawValue();
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
      this.currentStep--;
    }
  }
}
