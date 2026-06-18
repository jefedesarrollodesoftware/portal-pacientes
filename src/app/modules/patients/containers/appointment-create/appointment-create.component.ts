import { Component, DestroyRef, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastrService } from "ngx-toastr";
import { AppointmentService, PatientAttributesService } from "../../services";
import { PatientAttribute, Slot } from "../../models";

interface AppointmentForm {
  idSlot: FormControl<number | null>;
  idExam: FormControl<number | null>;
  dateRange: FormControl<string>;
  dateExpected: FormControl<string>;
}

@Component({
  selector: "app-appointment-create",
  templateUrl: "./appointment-create.component.html",
  styleUrls: ["./appointment-create.component.scss"],
  standalone: false,
})
export class AppointmentCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private patientAttributesService = inject(PatientAttributesService);
  private toastr = inject(ToastrService);
  private destroyRef = inject(DestroyRef);

  readonly form: FormGroup<AppointmentForm>;
  readonly loading = signal(true);
  readonly searchingSlots = signal(false);

  readonly exams = signal<PatientAttribute[]>([]);
  readonly slots = signal<Slot[]>([]);

  get idExam(): FormControl<number | null> {
    return this.form.controls.idExam;
  }

  get dateRange(): FormControl<string> {
    return this.form.controls.dateRange;
  }

  readonly rangeSeparator = " a ";

  get idSlot(): FormControl<number | null> {
    return this.form.controls.idSlot;
  }

  get dateExpected(): FormControl<string> {
    return this.form.controls.dateExpected;
  }

  constructor() {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.patientAttributesService
      .getByType("examenes")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.exams.set(res.data);
        },
        error: () => {
          this.loading.set(false);
          this.toastr.error("No se pudieron cargar los exámenes.");
        },
      });
  }

  private buildForm(): FormGroup<AppointmentForm> {
    return this.fb.group({
      idSlot: [null as number | null, [Validators.required]],
      idExam: [null as number | null, [Validators.required]],
      dateRange: ["" as string, [Validators.required]],
      dateExpected: ["" as string, [Validators.required]],
    });
  }

  onExamChange(): void {
    this.form.patchValue({ idSlot: null, dateExpected: "" });
    this.slots.set([]);
  }

  searchSlots(): void {
    const idExamValue = this.idExam.value;
    const rangeValue = this.dateRange.value;

    if (!idExamValue || !rangeValue) {
      this.toastr.error("Selecciona un examen y un rango de fechas.");
      return;
    }

    const parts = rangeValue.split(this.rangeSeparator);
    const dateBegin = parts[0]?.trim();
    const dateEnd = parts[1]?.trim() || dateBegin;

    this.searchingSlots.set(true);
    this.appointmentService
      .getSlots(idExamValue, dateBegin!, dateEnd!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.slots.set(res.data.slots.filter((s) => s.available !== false));
          this.searchingSlots.set(false);
          if (this.slots().length === 0) {
            this.toastr.info(
              "No hay horarios disponibles para este examen y rango de fechas.",
            );
          }
        },
        error: () => {
          this.searchingSlots.set(false);
          this.toastr.error("Error al consultar horarios disponibles.");
        },
      });
  }

  onSlotChange(): void {
    const selectedId = this.idSlot.value;
    if (selectedId === null) return;
    const slot = this.slots().find((s) => s.idSlot === selectedId);
    if (slot) {
      this.form.patchValue({ dateExpected: slot.dateSlot });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error("Corrige los errores del formulario.");
      return;
    }
  }
}
