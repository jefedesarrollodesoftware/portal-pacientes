import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { PatientService } from '../../services/patient.service';
import { PatientAttributesService } from '../../services/patient-attributes.service';
import { PatientAttribute } from '../../models';
import { setBackendErrors } from '../../utils/form-error-handler';

@Component({
  selector: 'app-patient-register',
  templateUrl: './patient-register.component.html',
  styleUrls: ['./patient-register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class PatientRegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitting = false;
  documentTypes: PatientAttribute[] = [];

  private readonly FALLBACK_DOC_TYPES: PatientAttribute[] = [
    { id: 1, code: 'CC', name: 'Cédula de Ciudadanía', short: 'CC', value: 'CC', description: null, order: 1, icon: null },
    { id: 2, code: 'CE', name: 'Cédula de Extranjería', short: 'CE', value: 'CE', description: null, order: 2, icon: null },
    { id: 3, code: 'NIT', name: 'NIT', short: 'NIT', value: 'NIT', description: null, order: 3, icon: null },
    { id: 4, code: 'PPT', name: 'Permiso por Protección Temporal', short: 'PPT', value: 'PPT', description: null, order: 4, icon: null },
    { id: 5, code: 'Pasaporte', name: 'Pasaporte', short: 'Pasaporte', value: 'Pasaporte', description: null, order: 5, icon: null },
  ];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private patientAttributesService: PatientAttributesService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDocumentTypes();
  }

  private buildForm(): void {
    this.registerForm = this.fb.group(
      {
        document_type_code: ['', Validators.required],
        document_number: ['', [Validators.required, Validators.maxLength(45)]],
        email: ['', [Validators.email, Validators.maxLength(191)]],
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

  private loadDocumentTypes(): void {
    this.patientAttributesService.getAll().subscribe({
      next: (res) => {
        this.documentTypes = res.data['tipo-documento'] || this.FALLBACK_DOC_TYPES;
      },
      error: () => {
        this.documentTypes = this.FALLBACK_DOC_TYPES;
      },
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.registerForm.value;

    this.patientService.register(payload).subscribe({
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
