# 🏥 Portal de Pacientes

Aplicación web **SPA (Single Page Application)** desarrollada con **Angular 21** que funciona como portal de autogestión para pacientes de una entidad de salud. Permite a los pacientes autenticarse, autorregistrarse con validación contra el sistema externo **Gomedisys** y gestionar sus citas médicas de forma autónoma.

El backend es una **API REST construida con Laravel Sanctum** (`admin-portal-pacientes.local/api/v1`) y el frontend se despliega con **Nginx** en un contenedor **Docker**.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Framework** | Angular | `^21.2.16` |
| **CLI** | `@angular/cli` | `^21.2.14` |
| **Lenguaje** | TypeScript | `~5.9.3` |
| **Build** | `@angular-devkit/build-angular` (builder: `application`) | `^21.2.14` |
| **Estilos** | SCSS + Bootstrap 5 | `^5.3.8` |
| **Íconos** | FontAwesome Free | `^7.2.0` |
| **Componentes UI** | ng-select, angularx-flatpickr, ngx-toastr | — |
| **Programación reactiva** | RxJS | `~7.8.0` |
| **Despliegue** | Docker + Nginx | — |

---

## 📁 Estructura del Proyecto

El proyecto sigue una **arquitectura basada en features** documentada en `docs/architecture-rules.md`.

```
src/
├── app/
│   ├── app.component.ts          # Componente raíz
│   ├── app.config.ts             # Configuración global
│   ├── app.module.ts             # Módulo raíz (bootstrap)
│   ├── app.routes.ts             # Rutas principales
│   ├── consts/                   # Constantes (rutas, colores, storage keys)
│   ├── modules/
│   │   ├── auth/                 # 🔐 Módulo de autenticación
│   │   │   ├── containers/       # Páginas: login/registro
│   │   │   ├── components/       # Formularios: login, registro, verificación
│   │   │   ├── guards/           # Auth guard
│   │   │   ├── models/           # Interfaces: User, Login
│   │   │   ├── services/         # PortalAuthService, CompanyService
│   │   │   └── pipes/            # Pipes auxiliares
│   │   └── patients/             # 🩺 Módulo de pacientes (lazy-loading)
│   │       ├── containers/       # Páginas: citas (lista, detalle, crear), pacientes (registro, lista, detalle)
│   │       ├── models/           # Interfaces: Patient, Appointment, Slot
│   │       ├── services/         # PatientService, AppointmentService, PatientAttributesService
│   │       └── utils/            # Utilidades (form-error-handler)
│   ├── shared/                   # 🔄 Código compartido
│   │   ├── layout/               # Layout shell (header + sidebar + router-outlet)
│   │   ├── header/               # Barra superior con logo y usuario
│   │   ├── sidebar/              # Navegación lateral
│   │   ├── footer/               # Pie de página
│   │   ├── not-found/            # Página 404
│   │   ├── components/           # Componentes reutilizables (searchable-select)
│   │   ├── services/             # AuthService, httpInterceptor, SharedService
│   │   └── models/               # Modelos compartidos
│   └── styles/                   # Estilos globales (SCSS)
├── assets/                       # Recursos estáticos
└── environments/                 # Configuración por entorno
```

### 🗺️ Rutas Principales

| Ruta | Descripción | Auth |
|---|---|---|
| `/login` | Página de inicio de sesión | ❌ |
| `/patients/register` | Registro público de pacientes | ❌ |
| `/dashboard` | Dashboard del paciente (redirige a citas) | ✅ |
| `/patients/appointments` | Listado de citas del paciente | ✅ |
| `/patients/appointments/new` | Crear nueva cita médica | ✅ |
| `/patients/appointments/:id` | Detalle de una cita | ✅ |
| `/404` | Página no encontrada | ❌ |

---

## 📋 Requisitos Previos

- **Node.js** (versión LTS recomendada)
- **Angular CLI 21** (`npm install -g @angular/cli@^21.2.14`)
- **Docker** (para despliegue con Nginx)
- **Backend Laravel** corriendo en `admin-portal-pacientes.local` (API REST con Sanctum)

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd portal-pacientes
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Editar los archivos en `src/environments/` según el entorno:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://admin-portal-pacientes.local',  // URL del backend Laravel
  companyId: 1,                                      // ID de la compañía
  appApiKey: 'tu-api-key'                            // API Key para el backend
};
```

Archivos de entorno disponibles:

| Archivo | Uso |
|---|---|
| `environment.ts` | Desarrollo local |
| `environment.prod.ts` | Producción |
| `environment.hmr.ts` | Hot Module Replacement |
| `environment.backend.ts` | Pruebas con backend real |

---

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo en `http://localhost:4200` (escucha en `0.0.0.0`) |
| `npm run build` | Compila el proyecto para producción (salida en `dist/`) |
| `npm run watch` | Compila en modo watch con configuración de desarrollo |
| `npm test` | Ejecuta tests (placeholder — sin tests configurados) |

---

## 🐳 Despliegue con Docker + Nginx

El proyecto incluye configuración para desplegar en un contenedor Docker con Nginx:

### Archivos de despliegue

- **`enter.sh`** — Script para ingresar al contenedor Docker en ejecución (`angular_portal_pacientes`).
- **`nginx.conf`** — Configuración de Nginx para servir la SPA con redirección de rutas a `index.html`.

### Flujo de despliegue

```bash
# Construir la aplicación para producción
npm run build

# La salida en dist/ es servida por Nginx dentro del contenedor Docker
# La configuración de nginx.conf maneja el routing de la SPA
```

---

## 📚 Documentación Interna

La carpeta `docs/` contiene las reglas y convenciones del proyecto:

| Documento | Contenido |
|---|---|
| `angular-rules.md` | Reglas generales de Angular |
| `architecture-rules.md` | Arquitectura basada en features |
| `component-rules.md` | Reglas para componentes |
| `forms-rules.md` | Reglas para formularios |
| `signals-rules.md` | Reglas para Angular Signals |
| `styling-rules.md` | Reglas de estilos y SCSS |
| `html-rules.md` | Reglas de HTML y templates |
| `naming-rules.md` | Convenciones de nomenclatura |
| `testing-rules.md` | Reglas de testing |
| `api-rules.md` | Reglas para consumo de APIs |
| `api-documentation.md` | Documentación de la API |
| `accessibility-rules.md` | Reglas de accesibilidad |

---

## 🔐 Autenticación

El sistema utiliza **Laravel Sanctum** para autenticación basada en tokens. El flujo es:

1. El paciente ingresa con su documento de identidad y contraseña.
2. El backend valida y retorna un token de acceso.
3. El token se almacena en `localStorage` y se envía en cada petición mediante un **HTTP Interceptor** (`http-interceptor.service.ts`).
4. Un **Auth Guard** protege las rutas que requieren autenticación.
5. En caso de error 401, el interceptor redirige automáticamente al login.

---

## 🎨 Personalización Visual

El `SharedService` gestiona temas visuales mediante `BehaviorSubject`:

- **Temas de color**: azul, rosa, verde.
- **Modo**: claro / oscuro.
- Aplicados dinámicamente en el `LayoutComponent`.

---

## 📄 Licencia

Este proyecto es privado.
