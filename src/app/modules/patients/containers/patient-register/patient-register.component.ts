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
import { PatientAttribute } from '../../models';
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
  registerForm: FormGroup;
  submitting = false;
  documentTypes: PatientAttribute[] = [];
  genders: PatientAttribute[] = [];
  civilStatuses: PatientAttribute[] = [];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private patientAttributesService: PatientAttributesService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCatalogs();
  }

  private buildForm(): void {
    this.registerForm = this.fb.group(
      {
        document_type_code: ['', Validators.required],
        document_number: ['', [Validators.required, Validators.maxLength(45)]],
        first_name: ['', [Validators.required, Validators.maxLength(120)]],
        last_name: ['', [Validators.required, Validators.maxLength(120)]],
        cellphone: ['', [Validators.required, Validators.maxLength(45)]],
        cellphone_code: ['', [Validators.maxLength(10)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(191)]],
        date_birth: [''],
        gender_code: [''],
        civil_status_code: [''],
        address: ['', Validators.maxLength(300)],
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirmation: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator },
    );
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

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.patientService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Paciente registrado correctamente.');
        this.router.navigate(['/login']);
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
}
