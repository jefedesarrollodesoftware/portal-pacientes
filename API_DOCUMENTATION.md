# API de Portal Pacientes — Documentación Técnica para Frontend Angular

---

## 1. Información General

| Propiedad | Valor |
|---|---|
| **Base URL** | `https://portal-pacientes.local/api/v1` |
| **Formato de respuesta** | JSON |
| **Autenticación** | Bearer Token (Laravel Sanctum) |
| **Encoding** | UTF-8 |
| **Content-Type (peticiones con body)** | `application/json` |
| **Content-Type (respuestas)** | `application/json` |

### 1.1 Cabeceras requeridas en toda petición autenticada

```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json   (solo en POST)
```

### 1.2 Envoltorio de respuesta estándar (AjaxResponse)

Toda respuesta de la API sigue esta estructura:

```typescript
interface ApiResponse<T = any> {
  status: boolean;   // true = éxito, false = error
  message: string;   // mensaje legible
  data: T;           // payload principal (null en algunos errores)
  // Pueden aparecer campos adicionales (ej: errores de validación)
}
```

---

## 2. Endpoints de Autenticación

### 2.1 Iniciar sesión / Obtener token

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/auth/token` |
| **Autenticación** | No |
| **Throttle** | `patient-auth` |

#### Cuerpo de la petición

```typescript
interface LoginRequest {
  email: string;          // required, formato email
  password: string;       // required, mínimo 1 carácter
  device_name?: string;   // opcional, max 120 chars, default "b2b-client"
  abilities?: string[];   // opcional, cada elemento max 120 chars, default ["*"]
}
```

**Ejemplo:**

```json
{
  "email": "admin@example.com",
  "password": "secreta123",
  "device_name": "web-angular-app"
}
```

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "Token generado correctamente.",
  "data": {
    "token": "1|abc123def456...",
    "token_type": "Bearer",
    "expires_at": "2026-06-09 12:00:00"
  }
}
```

```typescript
interface LoginResponse {
  token: string;
  token_type: string;   // Siempre "Bearer"
  expires_at: string | null;  // null si no expira, formato "Y-m-d H:i:s"
}
```

#### Respuestas de error

| Código | Condición | `message` |
|---|---|---|
| `422` | Validación fallida | `"Error de validacion."` + `data` con errores por campo |
| `401` | Credenciales inválidas | `"Credenciales invalidas."` |

**Ejemplo error 422:**

```json
{
  "status": false,
  "message": "Error de validacion.",
  "data": {
    "email": ["El email es obligatorio."],
    "password": ["La contrasena es obligatoria."]
  }
}
```

**Ejemplo error 401:**

```json
{
  "status": false,
  "message": "Credenciales invalidas.",
  "data": null
}
```

---

### 2.2 Cerrar sesión / Revocar token

| Propiedad | Valor |
|---|---|
| **Método** | `DELETE` |
| **URL** | `/api/v1/auth/token` |
| **Autenticación** | Bearer Token (Sanctum) |

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "Token revocado correctamente.",
  "data": null
}
```

#### Respuesta de error

| Código | Condición | `message` |
|---|---|---|
| `404` | No hay token activo | `"No se encontro un token activo para revocar."` |

---

### 2.3 Obtener usuario autenticado

| Propiedad | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `/api/v1/auth/me` |
| **Autenticación** | Bearer Token (Sanctum) |

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "id": 1,
    "person_id": null,
    "email": "admin@example.com",
    "email_verified_at": null,
    "last_login": "2026-05-26T12:00:00.000000Z",
    "inactivated_at": null,
    "token": "...",
    "profile_photo": null,
    "theme": null,
    "active": 1,
    "created_at": "2026-05-14T12:00:00.000000Z",
    "updated_at": "2026-05-26T12:00:00.000000Z"
  }
}
```

```typescript
interface User {
  id: number;
  person_id: number | null;
  email: string;
  email_verified_at: string | null;
  last_login: string | null;     // formato ISO 8601
  inactivated_at: string | null;
  token: string | null;
  profile_photo: string | null;
  theme: string | null;
  active: number;                 // 0 | 1
  created_at: string;
  updated_at: string;
}
```

---

## 3. Endpoints de Pacientes

### 3.1 Registro público de paciente (autoregistro)

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients/register` |
| **Autenticación** | No (pero si hay sesión, asigna empresa) |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface RegisterPatientRequest {
  document_type_code: string;   // required, ej: "CC", "NIT"
  document_number: string;      // required, ej: "1234567890"
  email?: string;               // opcional, formato email
  password: string;             // required, min 6 caracteres
  password_confirmation: string; // required, debe coincidir con password
}
```

**Nota:** El campo `password` debe enviarse con su confirmación (`password_confirmation`) por la regla `confirmed` de Laravel.

**Ejemplo:**

```json
{
  "document_type_code": "CC",
  "document_number": "1234567890",
  "email": "paciente@mail.com",
  "password": "secreta123",
  "password_confirmation": "secreta123"
}
```

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "Paciente registrado correctamente.",
  "data": {
    "patient": { /* objeto Patient (ver modelo abajo) */ },
    "account_state": {
      "active": true,
      "password_set": true
    },
    "source": "self-registration"
  }
}
```

```typescript
interface RegisterPatientResponse {
  patient: Patient;
  account_state: {
    active: boolean;
    password_set: boolean;
  };
  source: string;   // "self-registration"
}
```

#### Respuesta de error

| Código | Condición |
|---|---|
| `422` | Validación fallida |
| `500` | Error interno (API Gomedisys no disponible, etc.) |

---

### 3.2 Creación manual de paciente

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients` |
| **Autenticación** | Bearer Token |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface CreatePatientRequest {
  document_type_code: string;       // required, max 20
  document_number: string;          // required, max 45, unique compuesto con document_type_code
  first_name: string;               // required, max 120
  last_name: string;                // required, max 120
  email: string;                    // required, email, max 191, unique
  cellphone: string;                // required, max 45, unique
  cellphone_code?: string;          // opcional, max 10, ej: "57"
  document_expedition_date?: string; // opcional, formato fecha ISO (Y-m-d)
  date_birth?: string;              // opcional, formato fecha ISO (Y-m-d)
  gender_code?: string;             // opcional, max 20
  civil_status_code?: string;       // opcional, max 20
  address?: string;                 // opcional, max 300
  city_code?: string;               // opcional, max 20
  state_code?: string;              // opcional, max 20
  country_code?: string;            // opcional, max 20
  password?: string;                // opcional, min 8, requiere password_confirmation
  password_confirmation?: string;   // requerido si password está presente
}
```

**Ejemplo:**

```json
{
  "document_type_code": "CC",
  "document_number": "987654321",
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "cellphone": "3001234567",
  "cellphone_code": "57",
  "date_birth": "1990-01-15",
  "gender_code": "M",
  "civil_status_code": "S",
  "address": "Calle 123 #45-67",
  "city_code": "05001",
  "state_code": "05",
  "country_code": "CO",
  "password": "MiClaveSegura8",
  "password_confirmation": "MiClaveSegura8"
}
```

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "Paciente creado correctamente.",
  "data": {
    "patient": { /* objeto Patient */ },
    "access_created": true,
    "temp_password_sent": false,
    "source": "manual"
  }
}
```

```typescript
interface CreatePatientResponse {
  patient: Patient;
  access_created: boolean;
  temp_password_sent: boolean;
  source: string;   // "manual"
}
```

#### Respuesta de error

| Código | Condición |
|---|---|
| `422` | Validación fallida (errores en `data.errors`) |
| `500` | Error interno |

---

### 3.3 Consultar paciente por tipo y número de documento

| Propiedad | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `/api/v1/patients/{documentType}/{documentNumber}` |
| **Autenticación** | Bearer Token |
| **Throttle** | `patients` |

**Ejemplo:** `GET /api/v1/patients/CC/1234567890`

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "patient": { /* objeto Patient */ },
    "account_state": {
      "active": true,
      "password_set": true
    }
  }
}
```

```typescript
interface ShowPatientResponse {
  patient: Patient;
  account_state: {
    active: boolean;
    password_set: boolean;
  };
}
```

#### Respuesta de error

| Código | Condición |
|---|---|
| `404` | Paciente no encontrado |

---

### 3.4 Actualizar datos de paciente

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients/update` |
| **Autenticación** | Bearer Token |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface UpdatePatientRequest {
  id: number;                       // required, must exist in patients table
  document_type_code: string;        // required, max 20
  document_number: string;           // required, max 45, unique compuesto
  first_name: string;                // required, max 120
  last_name: string;                 // required, max 120
  email: string;                     // required, email, max 191, unique (ignora propio id)
  cellphone: string;                 // required, max 45, unique (ignora propio id)
  cellphone_code?: string;           // opcional, max 10
  document_expedition_date?: string; // opcional, fecha
  date_birth?: string;               // opcional, fecha
  gender_code?: string;              // opcional, max 20
  civil_status_code?: string;        // opcional, max 20
  address?: string;                  // opcional, max 300
  city_code?: string;                // opcional, max 20
  state_code?: string;               // opcional, max 20
  country_code?: string;             // opcional, max 20
}
```

Los campos `email` y `cellphone` tienen unicidad pero excluyen al paciente que se está editando gracias a `Rule::unique(...)->ignore($this->id)`.

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "El paciente se ha actualizado correctamente.",
  "data": { /* objeto Patient actualizado */ }
}
```

---

### 3.5 Cambiar contraseña de paciente

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients/update-password` |
| **Autenticación** | Bearer Token |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface UpdatePasswordRequest {
  id_password: number;              // required, must exist in patients table
  new_password: string;             // required, min 8, requiere confirmación
  new_password_confirmation: string; // required, debe coincidir
}
```

**Ejemplo:**

```json
{
  "id_password": 1,
  "new_password": "NuevaClaveSegura1",
  "new_password_confirmation": "NuevaClaveSegura1"
}
```

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "La contraseña del paciente se ha actualizado correctamente.",
  "data": null
}
```

---

### 3.6 Habilitar / Deshabilitar paciente

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients/disable-enable` |
| **Autenticación** | Bearer Token |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface DisableEnablePatientRequest {
  id: number;      // required, must exist in patients table
  active: boolean; // required: true = habilitar, false = deshabilitar
}
```

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "El paciente se ha habilitado correctamente.",
  "data": { /* objeto Patient actualizado */ }
}
```

O si `active: false`:

```json
{
  "status": true,
  "message": "El paciente se ha deshabilitado correctamente.",
  "data": { /* objeto Patient con active=false */ }
}
```

---

### 3.7 Sincronizar paciente desde Gomedisys

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients/sync` |
| **Autenticación** | Bearer Token |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface SyncPatientRequest {
  keyWS: string;              // required, max 120 — clave del web service
  codeTypeDocPatient: string; // required, max 20 — código tipo documento
  documentPatient: string;    // required, max 45 — número de documento
}
```

**Ejemplo:**

```json
{
  "keyWS": "ABC123KEY",
  "codeTypeDocPatient": "CC",
  "documentPatient": "1234567890"
}
```

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "Paciente sincronizado correctamente.",
  "data": {
    "patient": { /* objeto Patient */ },
    "synced": true,
    "created_or_updated": "created",  // o "updated"
    "source": "gomedisys"
  }
}
```

```typescript
interface SyncPatientResponse {
  patient: Patient;
  synced: boolean;
  created_or_updated: "created" | "updated";
  source: string;   // "gomedisys"
}
```

#### Respuesta de error

| Código | Condición |
|---|---|
| `422` | Validación fallida |
| `500` | Error al consultar Gomedisys |

---

## 4. Modelo de datos `Patient` (compartido en respuestas)

```typescript
interface Patient {
  id: number;
  company_id: number | null;
  document_type_code: string;
  document_number: string;
  document_expedition_date: string | null;  // formato "Y-m-d"
  first_name: string;
  last_name: string;
  date_birth: string | null;                // formato "Y-m-d"
  gender_code: string | null;
  civil_status_code: string | null;
  email: string;
  cellphone_code: string | null;
  cellphone: string;
  address: string | null;
  city_code: string | null;
  state_code: string | null;
  country_code: string | null;
  source: string;                           // "manual" | "gomedisys" | "self-registration"
  external_reference: string | null;
  active: boolean;
  last_login: string | null;                // formato ISO 8601
  created_at: string;
  updated_at: string;
}
```

---

## 5. Endpoints de Atributos de Paciente

### 5.1 Obtener todos los atributos agrupados por tipo

| Propiedad | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `/api/v1/patient-attributes` |
| **Autenticación** | Bearer Token |

#### Respuesta exitosa — `200 OK`

Los atributos se devuelven agrupados por el slug del tipo. Solo se incluyen tipos que tengan al menos un atributo activo.

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "tipo-documento": [
      {
        "id": 1,
        "code": "CC",
        "name": "Cédula de Ciudadanía",
        "short": "CC",
        "value": "CC",
        "description": "Documento de identidad colombiano",
        "order": 1,
        "icon": null
      },
      {
        "id": 2,
        "code": "NIT",
        "name": "NIT",
        "short": "NIT",
        "value": "NIT",
        "description": null,
        "order": 2,
        "icon": null
      }
    ],
    "sexo": [
      {
        "id": 5,
        "code": "M",
        "name": "Masculino",
        "short": "M",
        "value": "M",
        "description": null,
        "order": 1,
        "icon": null
      },
      {
        "id": 6,
        "code": "F",
        "name": "Femenino",
        "short": "F",
        "value": "F",
        "description": null,
        "order": 2,
        "icon": null
      }
    ]
  }
}
```

```typescript
// El data es un diccionario: { [typeSlug: string]: PatientAttribute[] }
type PatientAttributesResponse = Record<string, PatientAttribute[]>;
```

---

### 5.2 Obtener atributos de un tipo específico

| Propiedad | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `/api/v1/patient-attributes/{type}` |
| **Autenticación** | Bearer Token |

`{type}` es el slug del tipo de atributo (ej: `tipo-documento`, `sexo`, `genero`, `estado-civil`, `nivel-escolar`, `ocupacion`, `division-politica`, `zona-residencia`, `sede`, `asegurador`, `tipo-ingreso`, `causa-ingreso`, `via-ingreso`, `consultorio`, `linea-pago`, `diagnostico`).

**Ejemplo:** `GET /api/v1/patient-attributes/sexo`

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "OK",
  "data": [
    {
      "id": 5,
      "code": "M",
      "name": "Masculino",
      "short": "M",
      "value": "M",
      "description": null,
      "order": 1,
      "icon": null
    },
    {
      "id": 6,
      "code": "F",
      "name": "Femenino",
      "short": "F",
      "value": "F",
      "description": null,
      "order": 2,
      "icon": null
    }
  ]
}
```

#### Respuesta de error

| Código | Condición |
|---|---|
| `400` | Usuario no asociado a empresa |
| `404` | Tipo de atributo no encontrado (slug inválido o sin atributos) |
| `500` | Error interno |

### 5.3 Modelo `PatientAttribute`

```typescript
interface PatientAttribute {
  id: number;
  code: string;         // código del atributo (ej: "CC", "M", "S")
  name: string;         // nombre descriptivo
  short: string | null; // abreviatura
  value: string | null; // valor adicional
  description: string | null;
  order: number | null; // orden de visualización
  icon: string | null;  // clase o ruta de icono
}
```

---

## 6. Manejo de errores comunes

### 6.1 No autenticado — `401`

```json
{
  "message": "Unauthenticated."
}
```

El backend de Laravel devuelve este mensaje cuando el token falta, es inválido o expiró. No sigue el formato `AjaxResponse` porque es interceptado antes por el middleware `auth:sanctum`.

### 6.2 Error de validación — `422`

```json
{
  "status": false,
  "message": "Errores de validación:\n- El email es obligatorio.\n- La contraseña es obligatoria.",
  "data": {
    "email": ["El email es obligatorio."],
    "password": ["La contrasena es obligatoria."]
  }
}
```

El campo `data` contiene un objeto donde cada clave es el nombre del campo y el valor es un array de strings con los mensajes de error.

### 6.3 Error del servidor — `500`

```json
{
  "status": false,
  "message": "No fue posible crear el paciente.",
  "data": "Excepción interna: ..."
}
```

`data` contiene el mensaje de la excepción (útil para debugging, no debe mostrarse al usuario final).

---

## 7. Interfaces TypeScript completas

```typescript
// ===================================================
// Envoltorio de respuesta
// ===================================================
interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

// ===================================================
// Autenticación
// ===================================================
interface LoginRequest {
  email: string;
  password: string;
  device_name?: string;
  abilities?: string[];
}

interface LoginResponse {
  token: string;
  token_type: string;
  expires_at: string | null;
}

interface User {
  id: number;
  person_id: number | null;
  email: string;
  email_verified_at: string | null;
  last_login: string | null;
  inactivated_at: string | null;
  token: string | null;
  profile_photo: string | null;
  theme: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

// ===================================================
// Paciente
// ===================================================
interface Patient {
  id: number;
  company_id: number | null;
  document_type_code: string;
  document_number: string;
  document_expedition_date: string | null;
  first_name: string;
  last_name: string;
  date_birth: string | null;
  gender_code: string | null;
  civil_status_code: string | null;
  email: string;
  cellphone_code: string | null;
  cellphone: string;
  address: string | null;
  city_code: string | null;
  state_code: string | null;
  country_code: string | null;
  source: string;
  external_reference: string | null;
  active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

interface AccountState {
  active: boolean;
  password_set: boolean;
}

interface CreatePatientRequest {
  document_type_code: string;
  document_number: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  cellphone_code?: string;
  document_expedition_date?: string;
  date_birth?: string;
  gender_code?: string;
  civil_status_code?: string;
  address?: string;
  city_code?: string;
  state_code?: string;
  country_code?: string;
  password?: string;
  password_confirmation?: string;
}

interface UpdatePatientRequest {
  id: number;
  document_type_code: string;
  document_number: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  cellphone_code?: string;
  document_expedition_date?: string;
  date_birth?: string;
  gender_code?: string;
  civil_status_code?: string;
  address?: string;
  city_code?: string;
  state_code?: string;
  country_code?: string;
}

interface RegisterPatientRequest {
  document_type_code: string;
  document_number: string;
  email?: string;
  password: string;
  password_confirmation: string;
}

interface UpdatePasswordRequest {
  id_password: number;
  new_password: string;
  new_password_confirmation: string;
}

interface DisableEnablePatientRequest {
  id: number;
  active: boolean;
}

interface SyncPatientRequest {
  keyWS: string;
  codeTypeDocPatient: string;
  documentPatient: string;
}

// ===================================================
// Atributos de paciente (catálogos)
// ===================================================
interface PatientAttribute {
  id: number;
  code: string;
  name: string;
  short: string | null;
  value: string | null;
  description: string | null;
  order: number | null;
  icon: string | null;
}

// Respuesta de GET /patient-attributes (todos agrupados)
type PatientAttributesGrouped = Record<string, PatientAttribute[]>;
```

---

## 8. Tabla resumen de endpoints

| # | Método | URL | Autenticación | Throttle | Descripción |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/v1/auth/token` | No | `patient-auth` | Iniciar sesión |
| 2 | `DELETE` | `/api/v1/auth/token` | Sí | — | Cerrar sesión |
| 3 | `GET` | `/api/v1/auth/me` | Sí | — | Datos del usuario autenticado |
| 4 | `POST` | `/api/v1/patients/register` | No | `patients` | Autoregistro de paciente |
| 5 | `POST` | `/api/v1/patients` | Sí | `patients` | Creación manual |
| 6 | `GET` | `/api/v1/patients/{documentType}/{documentNumber}` | Sí | `patients` | Consultar paciente |
| 7 | `POST` | `/api/v1/patients/update` | Sí | `patients` | Actualizar datos |
| 8 | `POST` | `/api/v1/patients/update-password` | Sí | `patients` | Cambiar contraseña |
| 9 | `POST` | `/api/v1/patients/disable-enable` | Sí | `patients` | Habilitar/deshabilitar |
| 10 | `POST` | `/api/v1/patients/sync` | Sí | `patients` | Sincronizar con Gomedisys |
| 11 | `GET` | `/api/v1/patient-attributes` | Sí | — | Catálogos agrupados |
| 12 | `GET` | `/api/v1/patient-attributes/{type}` | Sí | — | Catálogos por tipo |

---

## 9. Flujo de autenticación recomendado (Angular)

1. El usuario ingresa email + password en un formulario de login.
2. Se llama a `POST /api/v1/auth/token`.
3. Si es exitoso, se almacena el `token` en `localStorage`/`sessionStorage` y en un `HttpInterceptor` que agrega `Authorization: Bearer {token}` a todas las peticiones.
4. Se redirige al dashboard.
5. En cada petición, si se recibe `401`, se redirige al login y se limpia el token almacenado.
6. Al cerrar sesión, se llama a `DELETE /api/v1/auth/token` y se elimina el token del almacenamiento local.

### Ejemplo de HttpInterceptor

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.removeItem('auth_token');
          // redirigir al login
        }
        return throwError(() => error);
      })
    );
  }
}
```

---

## 10. Consideraciones para formularios reactivos en Angular

### 10.1 Carga de catálogos en selects/dropdowns

Para poblar selects con valores de catálogo (tipo de documento, sexo, etc.):

```typescript
// En el servicio
getPatientAttributes(): Observable<ApiResponse<PatientAttributesGrouped>> {
  return this.http.get<ApiResponse<PatientAttributesGrouped>>(
    `${environment.apiUrl}/patient-attributes`
  );
}

// En el componente
this.patientService.getPatientAttributes().subscribe({
  next: (res) => {
    this.documentTypes = res.data['tipo-documento'] || [];
    this.genders = res.data['sexo'] || [];
    this.civilStatuses = res.data['estado-civil'] || [];
    // etc.
  }
});
```

### 10.2 Validaciones frontend

Mapear las validaciones del backend:

| Campo | Regla Angular |
|---|---|
| `document_type_code` | `Validators.required` |
| `document_number` | `Validators.required` |
| `first_name` | `Validators.required`, `Validators.maxLength(120)` |
| `last_name` | `Validators.required`, `Validators.maxLength(120)` |
| `email` | `Validators.required`, `Validators.email`, `Validators.maxLength(191)` |
| `cellphone` | `Validators.required`, `Validators.maxLength(45)` |
| `password` | `Validators.minLength(8)` (creación manual) o `Validators.minLength(6)` (registro) |
| `password_confirmation` | Debe coincidir con `password` (custom validator) |

### 10.3 Manejo de errores del backend

```typescript
// Servicio genérico
handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'Ocurrió un error inesperado.';

  if (error.status === 422 && error.error?.data) {
    // Errores de validación: error.error.data es { campo: ['msg1', 'msg2'] }
    // Mapear a los controles del formulario
    const validationErrors = error.error.data;
    Object.keys(validationErrors).forEach((field) => {
      const control = this.form.get(field);
      if (control) {
        control.setErrors({ backend: validationErrors[field].join('. ') });
      }
    });
  } else if (error.status === 401) {
    errorMessage = 'Credenciales inválidas.';
  } else if (error.status === 404) {
    errorMessage = error.error?.message || 'Recurso no encontrado.';
  } else {
    errorMessage = error.error?.message || errorMessage;
  }

  return throwError(() => errorMessage);
}
```

---

## 11. Glosario de slugs de catálogos

Estos son los slugs disponibles para el endpoint `GET /api/v1/patient-attributes/{type}`:

| Slug | Nombre |
|---|---|
| `tipo-documento` | Tipo Documento |
| `sexo` | Sexo |
| `genero` | Género |
| `estado-civil` | Estado Civil |
| `nivel-escolar` | Nivel Escolar |
| `ocupacion` | Ocupación |
| `division-politica` | División Política |
| `zona-residencia` | Zona Residencia |
| `sede` | Sede |
| `asegurador` | Asegurador |
| `tipo-ingreso` | Tipo Ingreso |
| `causa-ingreso` | Causa Ingreso |
| `via-ingreso` | Vía Ingreso |
| `consultorio` | Consultorio |
| `linea-pago` | Línea Pago |
| `diagnostico` | Diagnóstico |
