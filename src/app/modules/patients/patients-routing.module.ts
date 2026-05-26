import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../auth/guards';

import { PatientRegisterComponent } from './containers/patient-register/patient-register.component';
import { PatientListComponent } from './containers/patient-list/patient-list.component';
import { PatientDetailComponent } from './containers/patient-detail/patient-detail.component';
import { AppointmentListComponent } from './containers/appointment-list/appointment-list.component';
import { AppointmentDetailComponent } from './containers/appointment-detail/appointment-detail.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: PatientRegisterComponent,
  },
  {
    path: 'list',
    component: PatientListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'detail/:docType/:docNumber',
    component: PatientDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'appointments',
    component: AppointmentListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'appointments/:id',
    component: AppointmentDetailComponent,
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientsRoutingModule {}
