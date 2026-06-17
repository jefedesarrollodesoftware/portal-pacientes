import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { authGuard } from "../auth/guards";

import { AppointmentListComponent } from "./containers/appointment-list/appointment-list.component";
import { AppointmentDetailComponent } from "./containers/appointment-detail/appointment-detail.component";
import { AppointmentCreateComponent } from "./containers/appointment-create/appointment-create.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "appointments",
    pathMatch: "full",
  },
  {
    path: "appointments",
    component: AppointmentListComponent,
    canActivate: [authGuard],
  },
  {
    path: "appointments/new",
    component: AppointmentCreateComponent,
    canActivate: [authGuard],
  },
  {
    path: "appointments/:id",
    component: AppointmentDetailComponent,
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientsRoutingModule {}
