# Architecture Rules

- Use Feature-Based Architecture.
- Each business module must be isolated.
- Every feature owns:
  - routes
  - services
  - stores
  - pages
  - components
  - interfaces
  - dto
  - mappers

Structure:

features/
└── patients/
    ├── pages/
    ├── components/
    ├── services/
    ├── stores/
    ├── interfaces/
    ├── dto/
    ├── mappers/
    └── patients.routes.ts

Never place business code in shared/.

shared/ only contains reusable generic code.