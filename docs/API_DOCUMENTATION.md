# API de Portal Pacientes — Documentación Técnica para Frontend Angular

---

## 1. Información General

| Propiedad | Valor |
|---|---|
| **Base URL** | `https://admin-portal-pacientes.local/api/v1` |
| **Formato de respuesta** | JSON |
| **Autenticación** | Bearer Token (Laravel Sanctum) o API Key |
| **Encoding** | UTF-8 |
| **Content-Type (peticiones con body)** | `application/json` |
| **Content-Type (respuestas)** | `application/json` |

### 1.1 Cabeceras requeridas

#### Peticiones autenticadas (con sesión)

```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json   (solo en POST)
```

#### Peticiones públicas (sin sesión: auth/token, patients/register, patients/confirm-registration, patients/check-existence, patient-attributes, companies/{company})

```
X-API-Key: {api_key}
Accept: application/json
Content-Type: application/json   (solo en POST)
```

> La API Key se obtiene de la configuración del backend (`APP_API_KEY` en `.env`).
> Si se envía un `Authorization: Bearer` válido, la API Key no es necesaria.

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
| **Autenticación** | API Key (`X-API-Key`) |
| **Throttle** | `patient-auth` |

Autentica tanto a **usuarios administrativos** (tabla `users` + `people`) como a **pacientes autoregistrados** (tabla `patients`). Primero busca en `users`/`people`; si no encuentra coincidencia, busca en `patients`.

#### Cuerpo de la petición

```typescript
interface LoginRequest {
  document_type_id: string;  // required, ID numérico del tipo de documento (ej: "1", "2")
  numero_documento: string;  // required, número de documento
  contraseña: string;        // required, mínimo 1 carácter
  device_name?: string;      // opcional, max 120 chars, default "b2b-client"
  abilities?: string[];      // opcional, cada elemento max 120 chars, default ["*"]
}
```

**Ejemplo:**

```json
{
  "document_type_id": "1",
  "numero_documento": "1234567890",
  "contraseña": "secreta123",
  "device_name": "b2b-client"
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
    "document_type_id": ["El tipo de documento es obligatorio."],
    "contraseña": ["La contrasena es obligatoria."]
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

Retorna los datos del modelo autenticado. El objeto varía según quién inició sesión:

- **Usuario administrativo** (tabla `users` → `people`): incluye campos como `person_id`, `email_verified_at`, `inactivated_at`, `profile_photo`, `theme`.
- **Paciente autoregistrado** (tabla `patients`): incluye campos como `document_type_id`, `document_number`, `first_name`, `last_name`, `cellphone`, `address`, `source`, `external_reference`.

#### Respuesta exitosa (usuario administrativo) — `200 OK`

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

#### Respuesta exitosa (paciente autoregistrado) — `200 OK`

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "id": 1,
    "company_id": null,
    "document_type_id": 1,
    "document_number": "1110474142",
    "document_expedition_date": "2007-01-22T00:00:00.000000Z",
    "first_name": "Christian",
    "last_name": "Cortés",
    "date_birth": "1989-01-14T00:00:00.000000Z",
    "gender_id": 15,
    "gender_identity_id": null,
    "civil_status_id": 24,
    "scholarship_id": 38,
    "email": "paciente@mail.com",
    "cellphone_code": "57",
    "cellphone": "3001234567",
    "address": "Cra. 25c #76B-07 Piso 2",
    "source": "self-registration",
    "external_reference": "1110474142",
    "active": true,
    "last_login": "2026-06-12T19:02:27.000000Z",
    "created_at": "2026-06-12T19:02:27.000000Z",
    "updated_at": "2026-06-12T19:02:27.000000Z"
  }
}
```

```typescript
// Usuario administrativo
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

// Paciente autoregistrado
type AuthenticatedPatient = Patient;  // misma estructura que en sección 4
```

---

## 3. Endpoints de Pacientes

### 3.1 Inicio de registro público de paciente (autoregistro) — Paso 1

Este es el primer paso del registro. El sistema:
1. Valida que el paciente **exista en Gomedisys** (consulta externa).
2. Valida que el paciente **no exista en la base de datos local**.
3. Valida que `email` y `cellphone` no estén ya registrados por otro paciente.
4. Envía códigos de verificación de 6 dígitos al correo y al teléfono.
5. Retorna un `session_token` para usar en el paso 2.

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients/register` |
| **Autenticación** | API Key (`X-API-Key`) |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface RegisterPatientRequest {
  document_type_id: number;          // required, debe existir en attributes_patients
  document_number: string;           // required, max 45, ej: "1234567890"
  first_name: string;                // required, max 120
  last_name: string;                 // required, max 120
  email: string;                     // required, email, max 191
  cellphone: string;                 // required, max 45
  password: string;                  // required, min 6 caracteres
  password_confirmation: string;     // required, debe coincidir con password
  cellphone_code?: string;           // opcional, max 10, ej: "57"
  document_expedition_date?: string; // opcional, formato fecha ISO (Y-m-d)
  date_birth?: string;               // opcional, formato fecha ISO (Y-m-d)
  gender_id?: number;                // opcional, debe existir en attributes_patients
  gender_identity_id?: number;       // opcional, debe existir en attributes_patients
  civil_status_id?: number;          // opcional, debe existir en attributes_patients
  scholarship_id?: number;           // opcional, debe existir en attributes_patients
  address?: string;                  // opcional, max 300
  company_id?: number;               // opcional, debe existir en companies
}
```

**Nota:** El campo `password` debe enviarse con su confirmación (`password_confirmation`) por la regla `confirmed` de Laravel.

**Ejemplo:**

```json
{
  "document_type_id": 12,
  "document_number": "1234567890",
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "paciente@mail.com",
  "cellphone": "3001234567",
  "cellphone_code": "57",
  "password": "secreta123",
  "password_confirmation": "secreta123",
  "date_birth": "1990-01-15",
  "gender_id": 21
}
```

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "Códigos de verificación enviados.",
  "data": {
    "session_token": "550e8400-e29b-41d4-a716-446655440000",
    "expires_at": "2026-06-09T12:00:00.000000Z",
    "channels": {
      "email": true,
      "cellphone": true
    }
  }
}
```

```typescript
interface InitiateRegistrationResponse {
  session_token: string;   // UUID, expira en 10 minutos
  expires_at: string;      // ISO 8601
  channels: {
    email: boolean;        // true si se envió código al email
    cellphone: boolean;    // true si se envió código al celular
  };
}
```

#### Respuesta de error

| Código | Condición |
|---|---|
| `422` | Validación fallida / email o teléfono ya registrados / paciente ya existe |
| `500` | Error interno (API Gomedisys no disponible, etc.) |

---

### 3.2 Confirmar registro de paciente (autoregistro) — Paso 2

Confirma el registro usando el código de verificación recibido (por email o SMS) junto con el `session_token` del paso 1. Si el código es correcto, se crea el paciente en la base de datos.

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients/confirm-registration` |
| **Autenticación** | API Key (`X-API-Key`) |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface ConfirmRegistrationRequest {
  session_token: string;    // required, UUID obtenido en /register
  code: string;             // required, código de 6 dígitos recibido por email o SMS
}
```

**Ejemplo:**

```json
{
  "session_token": "550e8400-e29b-41d4-a716-446655440000",
  "code": "482913"
}
```

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "Paciente registrado correctamente.",
  "data": {
    "patient": { /* objeto Patient */ },
    "account_state": {
      "active": true,
      "password_set": true
    },
    "source": "self-registration"
  }
}
```

```typescript
interface ConfirmRegistrationResponse {
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
| `422` | Código inválido / sesión expirada |
| `500` | Error interno |

---

### 3.3 Creación manual de paciente

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients` |
| **Autenticación** | Bearer Token |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface CreatePatientRequest {
  document_type_id: number;         // required, debe existir en attributes_patients
  document_number: string;          // required, max 45, unique compuesto con document_type_id
  first_name: string;               // required, max 120
  last_name: string;                // required, max 120
  email: string;                    // required, email, max 191, unique
  cellphone: string;                // required, max 45, unique
  cellphone_code?: string;          // opcional, max 10, ej: "57"
  company_id?: number;              // opcional, ID de empresa a la que pertenece el paciente
  document_expedition_date?: string; // opcional, formato fecha ISO (Y-m-d)
  date_birth?: string;              // opcional, formato fecha ISO (Y-m-d)
  gender_id?: number;               // opcional, debe existir en attributes_patients
  gender_identity_id?: number;      // opcional, debe existir en attributes_patients
  civil_status_id?: number;         // opcional, debe existir en attributes_patients
  scholarship_id?: number;          // opcional, debe existir en attributes_patients
  address?: string;                 // opcional, max 300
  password?: string;                // opcional, min 8, requiere confirmación si se envía
  password_confirmation?: string;   // opcional, debe coincidir con password
}
```

**Ejemplo:**

```json
{
  "document_type_id": 12,
  "document_number": "987654321",
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "cellphone": "3001234567",
  "cellphone_code": "57",
  "company_id": 1,
  "date_birth": "1990-01-15",
  "gender_id": 21,
  "civil_status_id": 1,
  "address": "Calle 123 #45-67",
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

### 3.4 Consultar paciente por tipo y número de documento

| Propiedad | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `/api/v1/patients/{documentType}/{documentNumber}` |
| **Autenticación** | Bearer Token |
| **Throttle** | `patients` |

**Ejemplo:** `GET /api/v1/patients/CC/1234567890`
**Ejemplo con company_id:** `GET /api/v1/patients/CC/1234567890?company_id=1`

> El parámetro opcional `company_id` permite filtrar la búsqueda del paciente dentro de una empresa específica.

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

### 3.5 Actualizar datos de paciente

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients/update` |
| **Autenticación** | Bearer Token |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface UpdatePatientRequest {
  id: number;                        // required, must exist in patients table
  document_type_id: number;          // required, debe existir en attributes_patients
  document_number: string;           // required, max 45, unique compuesto
  first_name: string;                // required, max 120
  last_name: string;                 // required, max 120
  email: string;                     // required, email, max 191, unique (ignora propio id)
  cellphone: string;                 // required, max 45, unique (ignora propio id)
  cellphone_code?: string;           // opcional, max 10
  document_expedition_date?: string; // opcional, fecha
  date_birth?: string;               // opcional, fecha
  gender_id?: number;                // opcional, debe existir en attributes_patients
  gender_identity_id?: number;       // opcional, debe existir en attributes_patients
  civil_status_id?: number;          // opcional, debe existir en attributes_patients
  scholarship_id?: number;           // opcional, debe existir en attributes_patients
  address?: string;                  // opcional, max 300
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

### 3.6 Cambiar contraseña de paciente

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

### 3.7 Habilitar / Deshabilitar paciente

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

### 3.8 Verificar existencia de paciente por tipo y número de documento

Este endpoint permite al frontend Angular verificar si un paciente ya existe en el sistema mediante su tipo y número de documento.

| Propiedad | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/v1/patients/check-existence` |
| **Autenticación** | API Key (`X-API-Key`) |
| **Throttle** | `patients` |

#### Cuerpo de la petición

```typescript
interface CheckPatientExistenceRequest {
  document_type_id: number;    // required, debe existir en attributes_patients
  document_number: string;     // required, max 45, ej: "1234567890"
  company_id?: number;         // opcional, filtra por empresa
}
```

**Ejemplo:**
```json
{
  "document_type_id": 12,
  "document_number": "1234567890",
  "company_id": 1
}
```

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "exists": true,
    "patient": {
      "id": 1,
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "paciente@mail.com",
      "cellphone": "3001234567",
      "document_type_id": 12,
      "document_number": "1234567890"
    }
  }
}
```

Cuando el paciente **no existe**:
```json
{
  "status": true,
  "message": "OK",
  "data": {
    "exists": false,
    "patient": null
  }
}
```

```typescript
interface CheckPatientExistenceResponse {
  exists: boolean;
  patient: Patient | null;
}
```

#### Respuesta de error

| Código | Condición |
|---|---|
| `422` | Validación fallida (document_type_id o document_number faltantes) |

---

### 3.9 Sincronizar paciente desde Gomedisys

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
  document_type_id: number;   // required, debe existir en attributes_patients
  documentPatient: string;    // required, max 45 — número de documento
}
```

**Ejemplo:**

```json
{
  "keyWS": "ABC123KEY",
  "document_type_id": 12,
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

### 3.10 Enviar código de verificación (REMOVIDO)

Este endpoint ya no está expuesto como ruta pública en la API. La funcionalidad de envío y verificación de códigos permanece implementada en la capa de servicios (`app/Services/PatientService.php`) y está integrada dentro del flujo de autoregistro (`/patients/register` y `/patients/confirm-registration`).

Si necesita reenviar o verificar códigos desde el frontend, utilice el flujo de autoregistro descrito en las secciones 3.1 y 3.2. Si requiere un endpoint HTTP separado para reenviar/verificar códigos, solicite que lo agreguemos explícitamente y lo exponemos con validaciones y throttle adecuados.

---

### 3.11 Verificar código de verificación (REMOVIDO)

Este endpoint ya no está expuesto como ruta pública en la API. La verificación de códigos forma parte del flujo de autoregistro (`/patients/register` y `/patients/confirm-registration`) y se realiza por la lógica interna del servicio. Para comprobar códigos desde el frontend, use la secuencia completa de registro autoregistro.

---

## 4. Modelo de datos `Patient` (compartido en respuestas)

```typescript
interface Patient {
  id: number;
  company_id: number | null;
  document_type_id: number | null;
  document_number: string;
  document_expedition_date: string | null;  // formato "Y-m-d"
  first_name: string;
  last_name: string;
  date_birth: string | null;                // formato "Y-m-d"
  gender_id: number | null;
  gender_identity_id: number | null;
  civil_status_id: number | null;
  scholarship_id: number | null;
  email: string;
  cellphone_code: string | null;
  cellphone: string;
  address: string | null;
  source: string;
  external_reference: string | null;
  active: boolean;
  last_login: string | null;                // formato ISO 8601
  created_at: string;                       // formato ISO 8601
  updated_at: string;                       // formato ISO 8601
}

interface AccountState {
  active: boolean;
  password_set: boolean;
}

interface RegisterPatientRequest {
  document_type_id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  password: string;
  password_confirmation: string;
  cellphone_code?: string;
  document_expedition_date?: string;
  date_birth?: string;
  gender_id?: number;
  gender_identity_id?: number;
  civil_status_id?: number;
  scholarship_id?: number;
  address?: string;
  company_id?: number;
}

interface ConfirmRegistrationRequest {
  session_token: string;
  code: string;
}

interface InitiateRegistrationResponse {
  session_token: string;
  expires_at: string;
  channels: {
    email: boolean;
    cellphone: boolean;
  };
}

interface ConfirmRegistrationResponse {
  patient: Patient;
  account_state: {
    active: boolean;
    password_set: boolean;
  };
  source: string;
}

interface CreatePatientRequest {
  document_type_id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  cellphone_code?: string;
  company_id?: number;
  document_expedition_date?: string;
  date_birth?: string;
  gender_id?: number;
  gender_identity_id?: number;
  civil_status_id?: number;
  scholarship_id?: number;
  address?: string;
  password?: string;
  password_confirmation?: string;
}

interface UpdatePatientRequest {
  id: number;
  document_type_id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  cellphone_code?: string;
  document_expedition_date?: string;
  date_birth?: string;
  gender_id?: number;
  gender_identity_id?: number;
  civil_status_id?: number;
  scholarship_id?: number;
  address?: string;
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

interface CheckPatientExistenceRequest {
  document_type_id: number;
  document_number: string;
  company_id?: number;
}

interface CheckPatientExistenceResponse {
  exists: boolean;
  patient: Patient | null;
}

interface SyncPatientRequest {
  keyWS: string;
  document_type_id: number;
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

// ===================================================
// Empresa
// ===================================================
interface CompanyResponse {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  icon_url: string | null;
  logo: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  active: boolean;
}

// Respuesta de GET /patient-attributes (todos agrupados)
type PatientAttributesGrouped = Record<string, PatientAttribute[]>;
```

---

## 5. Endpoints de Empresa

### 5.1 Obtener datos de empresa

| Propiedad | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `/api/v1/companies/{company}` |
| **Autenticación** | API Key (`X-API-Key`) |
| **Parámetros URL** | `{company}` — ID numérico de la empresa |

Este endpoint retorna la información de diseño y personalización de una empresa (logotipo, icono, colores), útil para que el frontend Angular aplique la tematización correspondiente antes de que el usuario inicie sesión.

#### Respuesta exitosa — `200 OK`

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "id": 1,
    "name": "Mi Empresa",
    "slug": "mi-empresa",
    "icon": "iconos/empresa_1.png",
    "icon_url": "https://admin-portal-pacientes.local/storage/iconos/empresa_1.png",
    "logo": "logos/empresa_1.png",
    "logo_url": "https://admin-portal-pacientes.local/storage/logos/empresa_1.png",
    "primary_color": "#0047AB",
    "secondary_color": "#FF6600",
    "active": true
  }
}
```

```typescript
interface CompanyResponse {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  icon_url: string | null;
  logo: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  active: boolean;
}
```

#### Respuesta de error

| Código | Condición |
|---|---|
| `404` | Empresa no encontrada (ID inválido) |

---

## 6. Endpoints de Atributos de Paciente

### 6.1 Obtener todos los atributos agrupados por tipo

| Propiedad | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `/api/v1/patient-attributes` |
| **Autenticación** | API Key (`X-API-Key`) |
| **Parámetros query** | `company_id` (opcional) — necesario si no hay sesión autenticada |

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

### 6.2 Obtener atributos de un tipo específico

| Propiedad | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `/api/v1/patient-attributes/{type}` |
| **Autenticación** | API Key (`X-API-Key`) |
| **Parámetros query** | `company_id` (opcional) — necesario si no hay sesión autenticada |

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
| `401` | API key inválida o no proporcionada (falta `X-API-Key`) |
| `400` | Usuario no asociado a una empresa o `company_id` no proporcionado |
| `404` | Tipo de atributo no encontrado (slug inválido o sin atributos) |
| `500` | Error interno |

### 6.3 Modelo `PatientAttribute`

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

## 7. Manejo de errores comunes

### 7.1 No autenticado — `401`

#### Token Sanctum faltante o inválido (rutas con `auth:sanctum`)

```json
{
  "message": "Unauthenticated."
}
```

El backend de Laravel devuelve este mensaje cuando el token falta, es inválido o expiró. No sigue el formato `AjaxResponse` porque es interceptado antes por el middleware `auth:sanctum`.

#### API Key faltante o inválida (rutas públicas)

```json
{
  "status": false,
  "message": "API key inválida o no proporcionada.",
  "data": null
}
```

Se devuelve cuando no se envía la cabecera `X-API-Key` o su valor no coincide con `APP_API_KEY` del backend.

### 7.2 Error de validación — `422`

```json
{
  "status": false,
  "message": "Errores de validación:\n- El nombre es obligatorio.\n- El email es obligatorio.",
  "data": {
    "first_name": ["El nombre es obligatorio."],
    "email": ["El email es obligatorio."]
  }
}
```

El campo `data` contiene un objeto donde cada clave es el nombre del campo y el valor es un array de strings con los mensajes de error.

### 7.3 Error del servidor — `500`

```json
{
  "status": false,
  "message": "No fue posible crear el paciente.",
  "data": "Excepción interna: ..."
}
```

`data` contiene el mensaje de la excepción (útil para debugging, no debe mostrarse al usuario final).

---

## 8. Tabla resumen de endpoints

| # | Método | URL | Autenticación | Throttle | Descripción |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/v1/auth/token` | API Key | `patient-auth` | Iniciar sesión |
| 2 | `DELETE` | `/api/v1/auth/token` | Bearer Token | — | Cerrar sesión |
| 3 | `GET` | `/api/v1/auth/me` | Bearer Token | — | Datos del usuario autenticado |
| 4 | `POST` | `/api/v1/patients/register` | API Key | `patients` | Iniciar autoregistro (paso 1: validar + enviar códigos) |
| 5 | `POST` | `/api/v1/patients/confirm-registration` | API Key | `patients` | Confirmar autoregistro (paso 2: verificar códigos + crear) |
| 6 | `POST` | `/api/v1/patients` | Bearer Token | `patients` | Creación manual |
| 7 | `GET` | `/api/v1/patients/{documentType}/{documentNumber}` | Bearer Token | `patients` | Consultar paciente |
| 8 | `POST` | `/api/v1/patients/update` | Bearer Token | `patients` | Actualizar datos |
| 9 | `POST` | `/api/v1/patients/update-password` | Bearer Token | `patients` | Cambiar contraseña |
| 10 | `POST` | `/api/v1/patients/disable-enable` | Bearer Token | `patients` | Habilitar/deshabilitar |
| 11 | `POST` | `/api/v1/patients/sync` | Bearer Token | `patients` | Sincronizar con Gomedisys |
| 12 | `POST` | `/api/v1/patients/check-existence` | API Key | `patients` | Verificar existencia por documento/email/teléfono |
| 13 | (REMOVED) | `/api/v1/patients/send-code` | API Key | `patients` | Endpoint removido; usar flujo de autoregistro |
| 14 | (REMOVED) | `/api/v1/patients/verify-code` | API Key | `patients` | Endpoint removido; usar flujo de autoregistro |
| 15 | `GET` | `/api/v1/companies/{company}` | API Key | — | Datos de empresa (logo, colores, icono) |
| 16 | `GET` | `/api/v1/patient-attributes` | API Key | — | Catálogos agrupados |
| 17 | `GET` | `/api/v1/patient-attributes/{type}` | API Key | — | Catálogos por tipo |

---

## 9. Flujo de autenticación recomendado (Angular)

### 9.1 API Key para endpoints públicos

Los endpoints sin autenticación de sesión (`/auth/token`, `/patients/register`, `/patients/check-existence`, `/patient-attributes`, `/companies/{company}`) requieren la cabecera `X-API-Key`. Recomendamos configurarla en el `environment` de Angular:

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://admin-portal-pacientes.local/api/v1',
  apiKey: '3f7a2b1c-8d4e-5f69-a0b1-c2d3e4f5a6b7', // misma que APP_API_KEY en .env
};
```

Y crear un `HttpInterceptor` que agregue la API Key a todas las peticiones y el Bearer token cuando exista:

```typescript
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers: { [header: string]: string } = {};

    // Siempre enviar API Key (para endpoints públicos)
    headers['X-API-Key'] = environment.apiKey;

    // Si hay sesión, agregar Bearer token (reemplaza la API Key)
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    req = req.clone({ setHeaders: headers });
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && token) {
          localStorage.removeItem('auth_token');
          // redirigir al login
        }
        return throwError(() => error);
      })
    );
  }
}
```

### 9.2 Flujo de inicio de sesión

1. El usuario ingresa tipo de documento + número de documento + contraseña en un formulario de login.
2. Se llama a `POST /api/v1/auth/token` (con `X-API-Key`).
3. Si es exitoso, se almacena el `token` en `localStorage`/`sessionStorage`. Las siguientes peticiones incluirán `Authorization: Bearer {token}` además de `X-API-Key`.
4. Se redirige al dashboard.
5. En cada petición, si se recibe `401` teniendo un token almacenado, se redirige al login y se limpia el token.
6. Al cerrar sesión, se llama a `DELETE /api/v1/auth/token` y se elimina el token del almacenamiento local.

---

## 10. Consideraciones para formularios reactivos en Angular

### 10.1 Carga de catálogos en selects/dropdowns

Para poblar selects con valores de catálogo (tipo de documento, sexo, etc.), los catálogos requieren un `company_id` (empresa). Si el usuario no ha iniciado sesión, debes enviar el `company_id` como query parameter:

```typescript
// En el servicio
getPatientAttributes(companyId?: number): Observable<ApiResponse<PatientAttributesGrouped>> {
  let params = {};
  if (companyId) {
    params = { company_id: companyId };
  }
  return this.http.get<ApiResponse<PatientAttributesGrouped>>(
    `${environment.apiUrl}/patient-attributes`,
    { params }
  );
}

// En el componente (sin sesión — ejemplo con company_id fijo)
this.patientService.getPatientAttributes(1).subscribe({
  next: (res) => {
    this.documentTypes = res.data['tipo-documento'] || [];
    this.genders = res.data['sexo'] || [];
    this.civilStatuses = res.data['estado-civil'] || [];
    // etc.
  }
});

// En el componente (con sesión — el backend resuelve la empresa automáticamente)
this.patientService.getPatientAttributes().subscribe({
  next: (res) => { /* ... */ }
});
```

> **Nota:** Cuando se usa con `Authorization: Bearer` (usuario autenticado), el `company_id` se resuelve automáticamente desde la empresa del usuario. No es necesario enviar `company_id` en ese caso.

### 10.2 Validaciones frontend

Mapear las validaciones del backend:

| Campo | Regla Angular |
|---|---|---|
| Campo | Regla Angular |
|---|---|---|
| `document_type_id` | `Validators.required` (login) |
| `numero_documento` | `Validators.required` (login) |
| `contraseña` | `Validators.required` (login) |
| `document_type_id` | `Validators.required` (registro) |
| `document_number` | `Validators.required` |
| `first_name` | `Validators.required`, `Validators.maxLength(120)` |
| `last_name` | `Validators.required`, `Validators.maxLength(120)` |
| `email` | `Validators.required`, `Validators.email`, `Validators.maxLength(191)` |
| `cellphone` | `Validators.required`, `Validators.maxLength(45)` |
| `cellphone_code` | `Validators.maxLength(10)` |
| `document_expedition_date` | Opcional, formato fecha |
| `date_birth` | Opcional, formato fecha |
| `gender_id` | Opcional |
| `gender_identity_id` | Opcional |
| `civil_status_id` | Opcional |
| `scholarship_id` | Opcional |
| `address` | `Validators.maxLength(300)` |
| `password` | `Validators.minLength(6)` (registro) o `Validators.minLength(8)` (creación manual) |
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
