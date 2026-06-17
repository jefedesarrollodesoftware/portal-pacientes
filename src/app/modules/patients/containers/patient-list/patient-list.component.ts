import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { HttpErrorResponse } from "@angular/common/http";

import { PatientService } from "../../services/patient.service";
import { PatientAttributesService } from "../../services/patient-attributes.service";
import { Patient, PatientAttribute } from "../../models";
import { routes } from "../../../../consts";

@Component({
  selector: "app-patient-list",
  templateUrl: "./patient-list.component.html",
  styleUrls: ["./patient-list.component.scss"],
  standalone: false,
})
export class PatientListComponent {
  searchForm: FormGroup;
  searched = false;
  loading = false;
  patient: Patient | null = null;
  documentTypes: PatientAttribute[] = [];
  lastDocTypeCode = "";

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private patientAttributesService: PatientAttributesService,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.buildForm();
    this.loadDocumentTypes();
  }

  private buildForm(): void {
    this.searchForm = this.fb.group({
      document_type_code: ["", Validators.required],
      document_number: ["", Validators.required],
    });
  }

  private loadDocumentTypes(): void {
    this.patientAttributesService.getByType("tipo-documento").subscribe({
      next: (res) => {
        this.documentTypes = res.data;
      },
      error: () => {
        this.toastr.error("No se pudieron cargar los tipos de documento.");
      },
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.searched = true;
    this.patient = null;

    const { document_type_code, document_number } = this.searchForm.value;
    this.lastDocTypeCode = document_type_code;

    this.patientService
      .getByDocument(document_type_code, document_number)
      .subscribe({
        next: (res) => {
          this.patient = res.data.patient;
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          if (err.status === 404) {
            this.toastr.warning("Paciente no encontrado.");
          } else {
            this.toastr.error("Error al consultar el paciente.");
          }
        },
      });
  }

  viewDetail(): void {
    if (this.patient && this.lastDocTypeCode) {
      this.router.navigate([
        routes.PATIENTS_DETAIL,
        this.lastDocTypeCode,
        this.patient.document_number,
      ]);
    }
  }

  newSearch(): void {
    this.searched = false;
    this.patient = null;
    this.searchForm.reset();
  }
}
