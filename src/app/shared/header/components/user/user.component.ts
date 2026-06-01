import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Users } from '../../../models/users.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule],
})
export class UserComponent {
  @Input() user: Users;
  @Output() signOut: EventEmitter<void> = new EventEmitter<void>();

  public signOutEmit(): void {
    this.signOut.emit();
  }

  avatar() {
    return this.user && this.user.avatar && this.user.avatar.length
      ? this.user.avatar[0].publicUrl
      : './assets/profile.png';
  }
}
