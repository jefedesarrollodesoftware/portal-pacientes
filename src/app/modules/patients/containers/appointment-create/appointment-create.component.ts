import { Component, DestroyRef, OnInit, computed, inject, signal } from "@angular/core";
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
  readonly showSlotPicker = signal(false);
  readonly selectedSlotId = signal<number | null>(null);

  readonly slotGroups = computed(() => {
    const slots = this.slots();
    const map = new Map<string, { date: string; office: string; professional: string; modality: string; slots: Slot[] }>();
    for (const slot of slots) {
      const date = slot.startSlot.substring(0, 10);
      const key = `${date}|${slot.nameOffice}|${slot.nameProfessional}|${slot.modality}`;
      if (!map.has(key)) {
        map.set(key, { date, office: slot.nameOffice, professional: slot.nameProfessional, modality: slot.modality, slots: [] });
      }
      map.get(key)!.slots.push(slot);
    }
    return Array.from(map.values())
      .map((g) => ({
        ...g,
        slots: g.slots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.office.localeCompare(b.office));
  });

  get idExam(): FormControl<number | null> {
    return this.form.controls.idExam;
  }

  get dateRange(): FormControl<string> {
    return this.form.controls.dateRange;
  }

  readonly minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

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
          const allSlots = res.data.slots.filter((s) => s.available !== false);
          this.slots.set(allSlots);
          this.searchingSlots.set(false);
          if (allSlots.length === 0) {
            this.toastr.info(
              "No hay horarios disponibles para este examen y rango de fechas.",
            );
          } else {
            this.showSlotPicker.set(true);
            this.selectedSlotId.set(null);
            this.form.patchValue({ idSlot: null, dateExpected: "" });
          }
        },
        error: () => {
          this.searchingSlots.set(false);
          this.toastr.error("Error al consultar horarios disponibles.");
        },
      });
  }

  selectSlot(slotId: number): void {
    this.selectedSlotId.set(slotId);
    const slot = this.slots().find((s) => s.idSlot === slotId);
    if (slot) {
      this.form.patchValue({ idSlot: slotId, dateExpected: slot.startSlot });
    }
  }

  goBack(): void {
    this.showSlotPicker.set(false);
    this.slots.set([]);
    this.selectedSlotId.set(null);
    this.form.patchValue({ idSlot: null, dateExpected: "" });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error("Corrige los errores del formulario.");
      return;
    }
  }
}
