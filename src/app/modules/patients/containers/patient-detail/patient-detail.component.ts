import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import { PatientService } from "../../services/patient.service";
import { Patient } from "../../models";

@Component({
  selector: "app-patient-detail",
  templateUrl: "./patient-detail.component.html",
  styleUrls: ["./patient-detail.component.scss"],
  standalone: false,
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  loading = false;
  docType = "";

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.docType = this.route.snapshot.paramMap.get("docType") ?? "";
    const docNumber = this.route.snapshot.paramMap.get("docNumber");
    if (this.docType && docNumber) {
      this.loadPatient(this.docType, docNumber);
    }
  }

  private loadPatient(docType: string, docNumber: string): void {
    this.loading = true;
    this.patientService.getByDocument(docType, docNumber).subscribe({
      next: (res) => {
        this.patient = res.data.patient;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error("Paciente no encontrado.");
      },
    });
  }
}
