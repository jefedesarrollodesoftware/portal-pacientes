import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Users } from '../../../models/users.model';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
})
export class UserComponent {
  @Input() user: Users;
  @Output() signOut: EventEmitter<void> = new EventEmitter<void>();

  public signOutEmit(): void {
    this.signOut.emit();
  }

  firstUserLetter() {
    return (this.user?.firstName || this.user?.email || 'P')[0].toUpperCase();
  }

  avatar() {
    return this.user && this.user.avatar && this.user.avatar.length
      ? this.user.avatar[0].publicUrl
      : './assets/profile.png';
  }
}
