# API Rules

Always follow API_DOCUMENTATION.md.

Generate:

- dto
- mapper
- service
- interface

for every endpoint.

---

Folder structure:

patients/
├── dto/
├── interfaces/
├── mappers/
└── services/

---

Never consume raw API responses in components.

Always map DTO -> Model.

Example:

PatientDto
→ PatientMapper
→ Patient

---

All HTTP calls must:

- use typed responses
- handle errors
- return observables

---

Use interceptors for:

- Authorization
- API Key
- Error Handling

Never duplicate header logic.

---

The source of truth for endpoints is:

API_DOCUMENTATION.md