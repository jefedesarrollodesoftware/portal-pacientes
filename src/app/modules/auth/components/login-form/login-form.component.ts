import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, LoginCredentials } from '../../../../shared/services/auth.service';

export type LoginFormValue = LoginCredentials;

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule],
})
export class LoginFormComponent {
  @Output() sendLoginForm = new EventEmitter<LoginFormValue>();
  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  hidePassword = true;

  constructor(public authService: AuthService) {}

  login(): void {
    if (this.form.valid) {
      this.sendLoginForm.emit(this.form.getRawValue());
    }
  }
}
