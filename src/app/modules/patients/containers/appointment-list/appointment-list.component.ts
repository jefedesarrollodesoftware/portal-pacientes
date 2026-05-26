import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models';
import { routes } from '../../../../consts';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
  standalone: false,
})
export class AppointmentListComponent implements OnInit {
  displayedColumns: string[] = [
    'appointment_date',
    'appointment_time',
    'type',
    'doctor',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Appointment>([]);
  loading = false;
  filterStatus = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

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
        this.dataSource.data = res.data || [];
        this.loading = false;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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

  viewDetail(id: number): void {
    this.router.navigate([routes.PATIENTS_APPOINTMENTS, id]);
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
