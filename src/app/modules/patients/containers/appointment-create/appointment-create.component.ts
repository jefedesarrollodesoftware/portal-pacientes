import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { AppointmentService } from "../../services";
import { CatalogItem, Slot } from "../../models";

@Component({
  selector: "app-appointment-create",
  templateUrl: "./appointment-create.component.html",
  styleUrls: ["./appointment-create.component.scss"],
  standalone: false,
})
export class AppointmentCreateComponent implements OnInit {
  form: FormGroup;
  loading = true;
  searchingSlots = false;

  exams: CatalogItem[] = [];
  slots: Slot[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.appointmentService.getCatalog("Exams").subscribe({
      next: (res) => {
        this.exams = res.data.items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error("No se pudieron cargar los exámenes.");
      },
    });
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      idSlot: [null, [Validators.required]],
      idExam: [null, [Validators.required]],
      dateBegin: ["", [Validators.required]],
      dateEnd: [""],
      dateExpected: ["", [Validators.required]],
    });
  }

  onExamChange(): void {
    this.form.patchValue({ idSlot: null, dateExpected: "" });
    this.slots = [];
  }

  searchSlots(): void {
    const idExam = Number(this.form.get("idExam")?.value);
    const dateBegin = this.form.get("dateBegin")?.value;
    const dateEnd = this.form.get("dateEnd")?.value;

    if (!idExam || !dateBegin) {
      this.toastr.error("Selecciona un examen y una fecha de inicio.");
      return;
    }

    this.searchingSlots = true;
    this.appointmentService
      .getSlots(idExam, dateBegin, dateEnd || dateBegin)
      .subscribe({
        next: (res) => {
          this.slots = res.data.slots.filter((s) => s.available !== false);
          this.searchingSlots = false;
          if (this.slots.length === 0) {
            this.toastr.info(
              "No hay horarios disponibles para este examen y rango de fechas.",
            );
          }
        },
        error: () => {
          this.searchingSlots = false;
          this.toastr.error("Error al consultar horarios disponibles.");
        },
      });
  }

  onSlotChange(): void {
    const selectedId = Number(this.form.get("idSlot")?.value);
    const slot = this.slots.find((s) => s.idSlot === selectedId);
    if (slot) {
      this.form.patchValue({ dateExpected: slot.dateSlot });
    }
  }
}
