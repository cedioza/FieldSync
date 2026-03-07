# FieldSync v6 — Requerimientos Técnicos
**Plataforma de Field Service Dispatch para AccessParks**  
Documento para el equipo de desarrollo · Basado en el demo Wizard of Oz v6

---

## 1. Contexto del Proyecto

FieldSync es una plataforma de despacho de órdenes de trabajo de campo que conecta tres roles:

| Rol | Usuario demo | Empresa |
|-----|-------------|---------|
| **Dispatcher** | Marcus Prieto | AccessParks (cliente) |
| **Contractor** | Andrés Barrera | STS Corp. / Southwest Field Services |
| **Technician** | Carlos M. / Ramon V. | Técnicos en campo |

AccessParks es el **único proveedor aprobado de broadband dentro del sistema de Parques Nacionales de EE.UU.** y opera en más de 1,000 venues — MHCs, RV Parks, National Parks y comunidades residenciales en 6+ estados.

---

## 2. Tipos de Sitio

Cada orden pertenece a un tipo de sitio. El sistema debe diferenciarlos visualmente y en lógica de negocio.

| Código | Nombre | Descripción | Color |
|--------|--------|-------------|-------|
| `mhc` | Manufactured Housing Community | Residentes permanentes, fibra por lote | `#00e5a0` |
| `rvpark` | RV Park & Campground | Visitantes temporales, WiFi de alto tráfico | `#ffd93d` |
| `natpark` | U.S. National Park | Zonas remotas, coordinación con NPS | `#2d7aff` |
| `residential` | Residential Community | Edificios/condominios, infraestructura densa | `#c084fc` |

---

## 3. Tipos de Orden

| Código | Ícono | Descripción | Fotos requeridas |
|--------|-------|-------------|-----------------|
| `fault` | ⚡ | Falla de servicio — sin internet | 5 |
| `install` | 📡 | Instalación nueva por lote | 8 por lote |
| `upgrade` | ⬆ | Reemplazo de equipo (ej. DOCSIS 3.1) | 4 |
| `maintenance` | 🔧 | Inspección periódica de nodo | 4 |
| `survey` | 📋 | Levantamiento previo a instalación | 3 |

---

## 4. Flujo de una Orden (Estados)

```
critical → assigned → inprogress → done
(sin asignar)  (con contratista)  (técnico en campo)  (completado)
```

### Transiciones y responsable de cada una

| Transición | Quién la activa | Acción en sistema |
|-----------|----------------|-------------------|
| `critical → assigned` | Dispatcher (Marcus) | Selecciona contratista y envía orden |
| `assigned → inprogress` | Contractor (Andrés) | Asigna técnico del roster |
| `inprogress → done` | Technician (Carlos) | Marca orden resuelta + sube fotos |
| `assigned → critical` | Sistema (rechazo) | Contratista rechaza → re-asignación |

---

## 5. Schema — Firestore

### Colección: `workOrders`

```json
{
  "id": "AS-64462",
  "type": "fault",
  "siteType": "mhc",
  "region": "AZ",
  "status": "critical",

  "title": "Lot 205 — DLPC linking at 100 Mbps",
  "location": "Del Pueblo",
  "partner": "Cobblestone Communities",
  "address": "14794 S Ave 3 E, Yuma, AZ 85365",
  "lat": 32.600,
  "lng": -114.520,

  "task": "Check in at front office. Locate Lot 205...",
  "mopItems": ["Step 1...", "Step 2..."],
  "equipment": ["Windows laptop", "Mobile hotspot", "Ethernet cables"],

  "contractorId": null,
  "assignedTechId": null,
  "apEngineer": "Marcus Prieto",
  "apPhone": "858-997-2108",

  "hours": 2.5,
  "travelHours": 0.5,
  "completedAt": null,
  "createdAt": "2025-03-06T09:14:00Z",

  "photos": {},
  "workReport": null,

  "lots": null
}
```

**Notas:**
- `lots` solo se usa cuando `type === "install"` — es un array de objetos por lote
- `photos` es un objeto `{ photoKey: { url, timestamp, lat, lng, zip, lot } }`
- `workReport` se genera automáticamente cuando `status === "done"`

---

### Subcolección: `workOrders/{id}/lots` (solo para installs)

```json
{
  "num": "LOT 12",
  "client": "Maria Rodriguez",
  "scheduledAt": "08:00 AM",
  "status": "done",
  "photos": {},
  "signatureUrl": null
}
```

---

### Colección: `contractors`

```json
{
  "id": "STS",
  "name": "STS Corp.",
  "region": "Arizona / Cobblestone MHCs",
  "color": "#00e5a0",
  "contactName": "Andrés Barrera",
  "contactEmail": "andres@stscorp.com",
  "active": true
}
```

**Contratistas en el sistema:**
- `STS` — Arizona, Cobblestone Communities
- `SWFS` — Florida RV Parks + National Parks (MT/WY)

---

### Colección: `technicians`

```json
{
  "id": "T01",
  "name": "Carlos M.",
  "specialty": "WiFi / Low Voltage",
  "zone": "Arizona (STS)",
  "contractorId": "STS",
  "status": "busy",
  "ordersThisMonth": 4,
  "lat": 33.422,
  "lng": -111.750,
  "lastSeen": "2025-03-06T10:30:00Z"
}
```

**Valores de `status`:** `available` · `busy` · `off`

---

### Colección: `users`

```json
{
  "uid": "firebase-auth-uid",
  "name": "Marcus Prieto",
  "email": "marcus@accessparks.com",
  "role": "dispatcher",
  "contractorId": null
}
```

**Roles:** `dispatcher` · `contractor` · `technician`  
**Nota:** `contractorId` solo se usa cuando `role === "contractor"` o `"technician"`

---

### Colección: `photos` (metadata global, opcional)

```json
{
  "orderId": "AS-64462",
  "techId": "T01",
  "photoKey": "arrival",
  "url": "https://storage.googleapis.com/...",
  "timestamp": "2025-03-06T09:45:00Z",
  "lat": 32.601,
  "lng": -114.519,
  "zip": "85365",
  "lot": "LOT 205"
}
```

---

## 6. API Endpoints

Todos los endpoints requieren autenticación. El rol del token determina qué puede hacer.

### Work Orders

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| `GET` | `/api/orders` | Listar todas las órdenes (con filtros) | dispatcher, contractor |
| `GET` | `/api/orders/:id` | Detalle de una orden | todos |
| `POST` | `/api/orders` | Crear nueva orden | dispatcher |
| `PATCH` | `/api/orders/:id/assign` | Asignar contratista | dispatcher |
| `PATCH` | `/api/orders/:id/dispatch` | Asignar técnico | contractor |
| `PATCH` | `/api/orders/:id/complete` | Cerrar orden | technician |
| `POST` | `/api/orders/:id/photos` | Subir foto con metadata | technician |
| `GET` | `/api/orders/:id/report` | Generar PDF work report | dispatcher, contractor |

### Technicians

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| `GET` | `/api/technicians` | Listar técnicos del contratista | contractor |
| `POST` | `/api/technicians` | Agregar técnico | contractor |
| `PATCH` | `/api/technicians/:id/location` | Actualizar GPS | technician |

### Parámetros de filtro para `GET /api/orders`

```
?status=critical,assigned,inprogress,done
?type=fault,install,upgrade,maintenance,survey
?region=AZ,FL,MT,WY
?siteType=mhc,rvpark,natpark,residential
?contractorId=STS,SWFS
```

---

## 7. Checklists de Fotos por Tipo de Orden

El sistema no permite cerrar una orden hasta que todas las fotos estén capturadas.

### ⚡ Fault (5 fotos)
1. `arrival` — Foto de llegada con timestamp + número de lote visible
2. `before` — Estado del equipo al llegar
3. `work` — Trabajo en progreso
4. `after` — Estado resuelto
5. `speedtest` — Screenshot de speed test

### 📡 Install (8 fotos por lote)
1. `vault` — Vault / baúl (punto de origen de fibra)
2. `trench` — Zanja completa
3. `covered` — Zanja tapada y cubierta
4. `cable` — Entrada del cable + ruteo dentro del hogar
5. `router` — Router instalado
6. `serial` — Número de serie del router (claro y legible)
7. `speedtest` — Speed test (target: 500 Mbps)
8. `contract` — Contrato firmado por el cliente

### ⬆ Upgrade (4 fotos)
1. `old_equip` — Equipo antiguo con modelo y serial
2. `new_equip` — Nuevo módem instalado
3. `speed_before` — Speed test ANTES del upgrade
4. `speed_after` — Speed test DESPUÉS del upgrade

### 🔧 Maintenance (4 fotos)
1. `node` — Inspección del nodo (closeup)
2. `connectors` — Conectores de fibra
3. `meter` — Lectura del signal meter
4. `final` — Estado final después de limpieza

### 📋 Survey (3 fotos)
1. `overview` — Vista general del sitio
2. `infra` — Infraestructura existente / conduit
3. `proposed` — Ubicaciones propuestas de AP marcadas

### Metadata requerida en cada foto
```json
{
  "timestamp": "MM/DD/YYYY HH:MM:SS",
  "lat": 32.601,
  "lng": -114.519,
  "zip": "85365",
  "lot": "LOT 205"
}
```

---

## 8. Work Report (PDF)

Se genera automáticamente cuando una orden pasa a `done`. Debe incluir:

- **Header:** Logo AccessParks + número de orden + fecha
- **Datos del sitio:** nombre, partner, dirección, tipo de sitio
- **Tiempo en campo:** hora de llegada, salida, horas en campo, horas de viaje, total facturable
- **Técnicos:** nombre(s) y ID(s)
- **Resumen de trabajo:** notas del técnico
- **Tabla de fotos:** checklist con ✓/✗ por foto requerida, incluyendo timestamp y GPS
- **Línea de firma:** técnico + ingeniero AP
- **Footer:** "Número de orden debe aparecer en la factura del contratista"

**Librería recomendada:** `puppeteer` (renderiza HTML → PDF) o `pdfkit`

---

## 9. Notificaciones

| Evento | Canal | Destinatario |
|--------|-------|-------------|
| Nueva orden creada | Email + SMS | Contratista asignado |
| Técnico asignado | Push notification | Técnico |
| Orden completada | Email | Dispatcher (Marcus) |
| Orden rechazada | Email + SMS | Dispatcher (Marcus) |
| Foto subida (todas completas) | Push | Dispatcher |
| Ventana de respuesta vencida (2h) | Email + SMS | Dispatcher + Contratista |

**Stack recomendado:** Firebase Cloud Messaging (push) · Twilio (SMS) · SendGrid (email)

---

## 10. Stack Tecnológico Recomendado

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend** | Next.js 14 + React + Tailwind | El demo HTML ya tiene el diseño — migrar componente por componente |
| **Backend** | Next.js API Routes | Todo en un repositorio, deploy en Vercel |
| **Base de datos** | Firebase Firestore | Real-time nativo — cambios se reflejan sin polling |
| **Autenticación** | Firebase Auth | Roles en horas, no días |
| **Storage de fotos** | Firebase Storage | Integrado, URL directa en Firestore |
| **Mapa** | D3.js + TopoJSON | Ya implementado en el demo |
| **Notificaciones** | FCM + Twilio + SendGrid | Push + SMS + Email |
| **PDF** | Puppeteer | Renderiza el work report HTML → PDF |
| **Deploy** | Vercel | Un click, CI/CD automático |

---

## 11. Reglas de Seguridad (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Dispatchers ven todo
    match /workOrders/{orderId} {
      allow read: if isDispatcher();
      allow write: if isDispatcher();

      // Contractors solo ven sus órdenes
      allow read: if isContractor() &&
        resource.data.contractorId == getUserContractorId();
      allow update: if isContractor() &&
        resource.data.contractorId == getUserContractorId() &&
        onlyUpdating(['assignedTechId', 'status']);

      // Technicians solo ven su orden activa
      allow read: if isTechnician() &&
        resource.data.assignedTechId == request.auth.uid;
      allow update: if isTechnician() &&
        resource.data.assignedTechId == request.auth.uid &&
        onlyUpdating(['status', 'photos', 'completedAt', 'workReport']);
    }

    match /technicians/{techId} {
      allow read: if isAuthenticated();
      allow write: if isContractor();
      allow update: if isTechnician() && techId == request.auth.uid;
    }
  }
}
```

---

## 12. Demo Accounts (para pruebas)

| Email | Password | Rol | Vista |
|-------|----------|-----|-------|
| `marcus@accessparks.com` | `demo123` | dispatcher | Vista nacional completa |
| `andres@stscorp.com` | `demo123` | contractor (STS) | Solo órdenes STS |
| `carlos@stscorp.com` | `demo123` | technician | Vista mobile — orden activa |
| `ramon@swfs.com` | `demo123` | technician | Vista mobile — Florida/NPs |

---

## 13. Sitios Reales en el Sistema (Seed Data)

### MHCs — Cobblestone Communities (Arizona)
| ID | Nombre | Dirección |
|----|--------|-----------|
| `del-pueblo` | Del Pueblo | 14794 S Ave 3 E, Yuma, AZ 85365 |
| `citrus-gardens` | Citrus Gardens | 4065 E University Dr, Mesa, AZ 85205 |
| `desertscape` | Desertscape | 2050 W Dunlap Ave, Phoenix, AZ 85021 |
| `aspenwood` | Aspenwood | 245 S 56th St, Mesa, AZ 85206 |
| `las-quintas` | Las Quintas | 10442 N Frontage Rd, Yuma, AZ 85365 |
| `dorado-canyon` | Dorado Canyon | 3300 E Broadway Rd, Mesa, AZ 85204 |

### RV Parks — Yogi Bear's Jellystone (Florida)
| ID | Nombre | Dirección |
|----|--------|-----------|
| `jellystone-madison` | Jellystone Park™ Madison | 1051 SW Old St. Augustine Rd, Madison, FL 32340 |

### National Parks — AccessParks sole approved broadband provider
| ID | Nombre | Estado |
|----|--------|--------|
| `glacier-np` | Glacier National Park | West Glacier, MT 59936 |
| `yellowstone-np` | Yellowstone National Park | WY 82190 |
| `death-valley-np` | Death Valley National Park | CA 92328 |

---

## 14. Estimado de Desarrollo

| Fase | Descripción | Tiempo estimado |
|------|-------------|----------------|
| **Setup** | Repo, Firebase, Auth, deploy base | 1 semana |
| **Backend** | Firestore schema + API endpoints | 2 semanas |
| **Frontend dispatcher** | Migrar demo HTML → React components | 2 semanas |
| **Frontend contractor** | Dashboard STS/SWFS | 1 semana |
| **Frontend technician** | App mobile (PWA o React Native) | 2 semanas |
| **Fotos + GPS** | Upload, metadata, checklist | 1 semana |
| **PDF work report** | Puppeteer, auto-generate | 1 semana |
| **Notificaciones** | FCM + Twilio + SendGrid | 1 semana |
| **QA + deploy** | Testing, staging, producción | 1 semana |
| **Total** | | **~12 semanas** |

---

## 15. Preguntas para el Equipo

Antes de arrancar el desarrollo, definir:

1. ¿PWA o React Native para la app del técnico? (PWA es más rápido, React Native es más nativo)
2. ¿Multi-tenant desde el inicio? (para agregar más contratistas que STS y SWFS)
3. ¿AccessParks maneja el deploy o lo hospeda el equipo de STS?
4. ¿Se integra con el sistema de facturación existente o FieldSync genera las facturas?
5. ¿Necesita soporte offline para el técnico? (zonas remotas como National Parks)

---

*Documento generado a partir del demo FieldSync v6 — Wizard of Oz Pilot*  
*AccessParks · STS Corp. · Southwest Field Services*
