import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models';

@Component({
  selector: 'app-appointment-detail',
  templateUrl: './appointment-detail.component.html',
  styleUrls: ['./appointment-detail.component.scss'],
  standalone: false,
})
export class AppointmentDetailComponent implements OnInit {
  appointment: Appointment | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadAppointment(Number(idParam));
    }
  }

  private loadAppointment(id: number): void {
    this.loading = true;
    this.appointmentService.getAppointmentById(id).subscribe({
      next: (res) => {
        this.appointment = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Error al cargar el detalle de la cita.');
      },
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return map[status] || '';
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
