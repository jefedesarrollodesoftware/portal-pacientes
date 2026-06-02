import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models';
import { routes } from '../../../../consts';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: [],
  standalone: false,
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = false;
  filterStatus = '';

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    const params = this.filterStatus ? { status: this.filterStatus } : undefined;

    this.appointmentService.getMyAppointments(params).subscribe({
      next: (res) => {
        this.appointments = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Error al cargar las citas.');
      },
    });
  }

  get dataSource() {
    return { data: this.appointments };
  }

  applyFilters(): void {
    this.loadAppointments();
  }

  viewDetail(id: number): void {
    this.router.navigate([routes.PATIENTS_APPOINTMENTS, id]);
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return map[status] || status;
  }
}
