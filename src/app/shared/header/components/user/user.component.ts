import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Users } from '../../../models/users.model';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: [],
  standalone: true,
  imports: [],
})
export class UserComponent {
  @Input() user: Users;
  @Output() signOut: EventEmitter<void> = new EventEmitter<void>();

  public signOutEmit(): void {
    this.signOut.emit();
  }
}
