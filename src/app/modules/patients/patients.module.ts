import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { PatientsRoutingModule } from "./patients-routing.module";
import { AppointmentListComponent } from "./containers/appointment-list/appointment-list.component";
import { AppointmentDetailComponent } from "./containers/appointment-detail/appointment-detail.component";
import { AppointmentCreateComponent } from "./containers/appointment-create/appointment-create.component";

@NgModule({
  declarations: [
    AppointmentListComponent,
    AppointmentDetailComponent,
    AppointmentCreateComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PatientsRoutingModule,
  ],
})
export class PatientsModule {}
