import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { APP_RUNTIME_CONFIG, AppRuntimeConfig } from '../../../../app.config';
import { PatientAttributesService } from '../../../patients/services/patient-attributes.service';
import { PatientAttribute } from '../../../patients/models';

export type LoginFormValue = {
  document_type_code: string;
  document_number: string;
  password: string;
};

const FALLBACK_DOC_TYPES: PatientAttribute[] = [
  { id: 1, code: 'CC', name: 'Cédula de Ciudadanía', short: 'CC', value: 'CC', description: 'Documento de identidad colombiano', order: 1, icon: null },
  { id: 2, code: 'CE', name: 'Cédula de Extranjería', short: 'CE', value: 'CE', description: null, order: 2, icon: null },
  { id: 3, code: 'NIT', name: 'NIT', short: 'NIT', value: 'NIT', description: null, order: 3, icon: null },
  { id: 4, code: 'PPT', name: 'Permiso por Protección Temporal', short: 'PPT', value: 'PPT', description: null, order: 4, icon: null },
  { id: 5, code: 'Pasaporte', name: 'Pasaporte', short: 'Pasaporte', value: 'Pasaporte', description: null, order: 5, icon: null },
];

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
})
export class LoginFormComponent implements OnInit {
  @Output() sendLoginForm = new EventEmitter<LoginFormValue>();
  form!: FormGroup;
  documentTypes: PatientAttribute[] = FALLBACK_DOC_TYPES;
  hidePassword = true;

  constructor(
    @Inject(APP_RUNTIME_CONFIG) private appConfig: AppRuntimeConfig,
    private patientAttributesService: PatientAttributesService,
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      document_type_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      document_number: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(45)] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    });
    this.loadDocumentTypes();
  }

  private loadDocumentTypes(): void {
    this.patientAttributesService.getAll().subscribe({
      next: (res) => {
        this.documentTypes = res.data['tipo-documento'] || FALLBACK_DOC_TYPES;
      },
      error: () => {
        this.documentTypes = FALLBACK_DOC_TYPES;
      },
    });
  }

  login(): void {
    if (this.form.valid) {
      this.sendLoginForm.emit(this.form.getRawValue());
    }
  }
}
