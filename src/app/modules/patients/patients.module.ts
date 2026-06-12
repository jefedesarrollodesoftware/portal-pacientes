import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PatientsRoutingModule } from './patients-routing.module';
import { AppointmentListComponent } from './containers/appointment-list/appointment-list.component';
import { AppointmentDetailComponent } from './containers/appointment-detail/appointment-detail.component';

@NgModule({
  declarations: [
    AppointmentListComponent,
    AppointmentDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PatientsRoutingModule,
  ],
})
export class PatientsModule {}
