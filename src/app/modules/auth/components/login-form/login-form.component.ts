import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, LoginCredentials } from '../../../../shared/services/auth.service';
import { PatientAttributesService } from '../../../patients/services/patient-attributes.service';
import { PatientAttribute } from '../../../patients/models';

export type LoginFormValue = LoginCredentials;

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule],
})
export class LoginFormComponent implements OnInit {
  @Output() sendLoginForm = new EventEmitter<LoginFormValue>();
  form = new FormGroup({
    tipo_documento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    numero_documento: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(45)] }),
    contraseña: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  documentTypes: PatientAttribute[] = [];
  hidePassword = true;

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
}
