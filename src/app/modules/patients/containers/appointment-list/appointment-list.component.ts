import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AppointmentService, AppointmentStateService } from '../../services';
import { Appointment, AppointmentState } from '../../models';
import { routes } from '../../../../consts';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
  standalone: false,
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  appointmentStates: AppointmentState[] = [];
  loading = false;
  filterStatus = '';

  constructor(
    private appointmentService: AppointmentService,
    private appointmentStateService: AppointmentStateService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAppointmentStates();
    this.loadAppointments();
  }

  private loadAppointmentStates(): void {
    this.appointmentStateService.getAll().subscribe({
      next: (res) => {
        this.appointmentStates = res.data.states;
      },
      error: () => {
        this.toastr.error('Error al cargar los estados de citas.');
      },
    });
  }

  loadAppointments(): void {
    this.loading = true;
    const params = this.filterStatus ? { states: this.filterStatus } : undefined;

    this.appointmentService.getMyAppointments(params).subscribe({
      next: (res) => {
        this.appointments = res.data.appointments || [];
        this.appointmentService.setAppointmentsCache(this.appointments);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Error al cargar las citas.');
      },
    });
  }

  applyFilters(): void {
    this.loadAppointments();
  }

  viewDetail(appointment: Appointment): void {
    this.router.navigate([routes.PATIENTS_APPOINTMENTS, appointment.idAppointment]);
  }

  getFullDoctorName(a: Appointment): string {
    const parts = [a.firstGNameProfessional, a.secondGNameProfessional, a.firstFNameProfessional, a.secondFNameProfessional];
    return parts.filter(Boolean).join(' ');
  }

  statusBadgeClass(codeState: string): string {
    const map: Record<string, string> = {
      S: 'status-requested',
      C: 'status-cancelled',
      P: 'status-pending',
      A: 'status-confirmed',
    };
    return map[codeState] || 'status-completed';
  }

  modalityBadgeClass(modality: string): string {
    const map: Record<string, string> = {
      'Presencial': 'modality-presential',
      'Virtual': 'modality-virtual',
    };
    return map[modality] || '';
  }

  getModalityIcon(modality: string): string {
    const map: Record<string, string> = {
      'Presencial': 'fa-solid fa-house',
      'Virtual': 'fa-solid fa-video',
    };
    return map[modality] || 'fa-solid fa-stethoscope';
  }
}
