# Forms Rules

Use Reactive Forms only.

Never use:

ngModel

All forms must:

- use FormBuilder
- use typed forms
- use validators

Example:

form = this.fb.nonNullable.group({
  email: ['', [Validators.required]]
});

---

Custom validators must be reusable.

Store validators in:

shared/validators

---

Backend validation errors must be mapped to controls.

422 errors must populate form errors automatically.