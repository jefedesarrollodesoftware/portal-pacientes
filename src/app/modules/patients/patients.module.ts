import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";

import { PatientsRoutingModule } from "./patients-routing.module";
import { AppointmentListComponent } from "./containers/appointment-list/appointment-list.component";
import { AppointmentDetailComponent } from "./containers/appointment-detail/appointment-detail.component";
import { AppointmentCreateComponent } from "./containers/appointment-create/appointment-create.component";
import { FlatpickrDirective, provideFlatpickrDefaults } from "angularx-flatpickr";
import { Spanish } from "flatpickr/dist/esm/l10n/es.js";

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
    NgSelectModule,
    PatientsRoutingModule,
    FlatpickrDirective,
  ],
  providers: [
    provideFlatpickrDefaults({ locale: Spanish }),
  ],
})
export class PatientsModule {}
