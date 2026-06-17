import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import { AppointmentService } from "../../services";
import { Appointment } from "../../models";

interface ProductInfo {
  idProduct: number;
  legalCode: string;
  name: string;
}

@Component({
  selector: "app-appointment-detail",
  templateUrl: "./appointment-detail.component.html",
  styleUrls: ["./appointment-detail.component.scss"],
  standalone: false,
})
export class AppointmentDetailComponent implements OnInit {
  appointment: Appointment | null = null;
  notFound = false;
  products: ProductInfo[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (!idParam) {
      this.notFound = true;
      return;
    }

    const id = Number(idParam);
    const cached = this.appointmentService.getAppointmentFromCache(id);

    if (cached) {
      this.appointment = cached;
      this.parseProducts();
    } else {
      this.notFound = true;
      this.toastr.error("No se encontró la información de la cita.");
    }
  }

  private parseProducts(): void {
    if (this.appointment?.products) {
      try {
        this.products = JSON.parse(this.appointment.products);
      } catch {
        this.products = [];
      }
    }
  }

  getFullDoctorName(a: Appointment): string {
    const parts = [
      a.firstGNameProfessional,
      a.secondGNameProfessional,
      a.firstFNameProfessional,
      a.secondFNameProfessional,
    ];
    return parts.filter(Boolean).join(" ");
  }

  statusBadgeClass(codeState: string): string {
    const map: Record<string, string> = {
      S: "status-requested",
      C: "status-cancelled",
      P: "status-pending",
      A: "status-confirmed",
    };
    return map[codeState] || "status-completed";
  }

  modalityBadgeClass(modality: string): string {
    const map: Record<string, string> = {
      Presencial: "modality-presential",
      Virtual: "modality-virtual",
    };
    return map[modality] || "";
  }

  getModalityIcon(modality: string): string {
    const map: Record<string, string> = {
      Presencial: "fa-solid fa-house",
      Virtual: "fa-solid fa-video",
    };
    return map[modality] || "fa-solid fa-stethoscope";
  }
}
