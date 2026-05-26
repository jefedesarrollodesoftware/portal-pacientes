import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

import { PatientService } from '../../services/patient.service';
import { PatientAttributesService } from '../../services/patient-attributes.service';
import { PatientAttribute } from '../../models';
import { setBackendErrors } from '../../utils/form-error-handler';

@Component({
  selector: 'app-patient-register',
  templateUrl: './patient-register.component.html',
  styleUrls: ['./patient-register.component.scss'],
  standalone: false,
})
export class PatientRegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitting = false;
  documentTypes: PatientAttribute[] = [];

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
        this.documentTypes = res.data['tipo-documento'] || [];
      },
      error: () => {
        this.toastr.error('No se pudieron cargar los tipos de documento.');
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
