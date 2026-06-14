# Component Rules

## Atomization

Build components following Atomic Design.

Order:

- Atoms
- Molecules
- Organisms
- Pages

Example:

patients/
├── atoms/
│   ├── input-text
│   ├── button
│   └── spinner
│
├── molecules/
│   ├── patient-search
│   └── password-field
│
├── organisms/
│   ├── patient-form
│   └── patient-table
│
└── pages/
    └── patient-register

---

## Inputs

All inputs must be reusable components.

Forbidden:

<input type="text">

directly repeated across screens.

Required:

<app-text-input>

or

<app-password-input>

---

## Outputs

Use output().

Preferred:

readonly saved = output<Patient>();

Avoid:

@Output()

---

## Inputs API

Use input().

Preferred:

readonly patient = input.required<Patient>();

Avoid:

@Input()

---

## Component Size

Recommended:

- 200 lines max TS
- 200 lines max HTML

Hard limit:

- 400 lines

Refactor after that.

---

## Smart / Dumb Components

Pages:

- handle orchestration
- call services

Components:

- presentation only

No HTTP inside reusable components.