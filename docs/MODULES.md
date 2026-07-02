# Catálogo de Módulos

> **Companion de `ARCHITECTURE.md`.** Este documento lista todos los módulos planificados, agrupados por categoría, con su estado, prioridad y racional. También define cómo agregar nuevos módulos manteniendo la coherencia arquitectónica.

---

## Índice

1. [Filosofía del catálogo](#1-filosofía-del-catálogo)
2. [Categorías](#2-categorías)
3. [Módulos Core (siempre activos)](#3-módulos-core-siempre-activos)
4. [Módulos Business (transversales)](#4-módulos-business-transversales)
5. [Módulos Verticales (por rubro)](#5-módulos-verticales-por-rubro)
6. [Módulos de Integraciones](#6-módulos-de-integraciones)
7. [Módulos de IA](#7-módulos-de-ia)
8. [Cómo crear un nuevo módulo](#8-cómo-crear-un-nuevo-módulo)
9. [Matriz módulo × rubro](#9-matriz-módulo--rubro)
10. [Priorización](#10-priorización)

---

## 1. Filosofía del catálogo

### 1.1 Reglas de negocio para módulos

1. **Un módulo resuelve UNA cosa bien.** Si un módulo hace CRM + facturación + agenda, no es un módulo, es un monolito.
2. **Los módulos transversales viven separados de los verticales.** El módulo "Pacientes" no incluye agenda; usa el módulo Agenda genérico.
3. **Un módulo vertical es una composición inteligente + tablas específicas.** Un vertical puede depender de varios transversales.
4. **Un módulo se puede vender solo.** Si no tiene valor standalone, no debería ser un módulo aparte.
5. **La UI de un módulo es coherente con el design system.** No hay "look propio" por módulo.

### 1.2 Estados del catálogo

- **`stable`** — Ya construido y en producción.
- **`beta`** — Construido, en testeo con early adopters.
- **`planned`** — Definido y priorizado.
- **`ideation`** — Anotado como idea, sin priorización aún.
- **`deprecated`** — Existió pero se está desmontando.

---

## 2. Categorías

Cada módulo pertenece a exactamente una categoría. Esto sirve para el marketplace y para el onboarding (agrupar sugerencias).

| Categoría | Propósito |
|-----------|-----------|
| `core` | Requeridos para el funcionamiento base de cualquier tenant |
| `sales` | Ventas, CRM, cotizaciones |
| `finance` | Facturación, cobros, gastos, contabilidad |
| `operations` | Stock, compras, proveedores, logística |
| `scheduling` | Agenda, turnos, reservas, recursos |
| `hr` | Empleados, asistencia, liquidaciones |
| `projects` | Gestión de proyectos, tareas, tiempo |
| `customer_service` | Tickets, chat, satisfacción |
| `marketing` | Campañas, email, formularios, landing |
| `vertical` | Específicos de un rubro (kinesiología, restaurantes, etc.) |
| `integration` | Conectores con servicios externos |
| `ai` | Capacidades de IA activables |
| `analytics` | Reportes avanzados, dashboards custom |

---

## 3. Módulos Core (siempre activos)

Estos vienen incluidos en todos los planes y **no se pueden desactivar**. Son la infraestructura base sobre la que corren los demás módulos.

### 3.1 `identity` — Identidad y accesos

- Usuarios, sesiones, autenticación.
- Invitaciones, aceptación, gestión de miembros.
- 2FA, magic links, OAuth.
- **Prioridad:** P0 (Fase 0/1)

### 3.2 `tenants` — Tenants y configuración base

- Datos de la empresa.
- Configuraciones generales (zona horaria, idioma, moneda base).
- Cambio de plan y billing view.
- **Prioridad:** P0 (Fase 0/1)

### 3.3 `branding` — Branding y personalización visual

- Logos, favicon, paleta de colores.
- Tipografías.
- Textos personalizables (nombre visible, tagline).
- Vista previa en vivo.
- **Prioridad:** P0 (Fase 1)

### 3.4 `roles` — Roles y permisos

- Roles del sistema (Owner, Admin, Manager, Member, Viewer).
- Creación de roles custom.
- Asignación de permisos granulares.
- **Prioridad:** P0 (Fase 1)

### 3.5 `dashboard` — Dashboard global

- Página inicial con widgets aportados por otros módulos.
- Configurable por usuario (drag & drop).
- Widgets built-in: bienvenida, actividad reciente, resumen de módulos.
- **Prioridad:** P0 (Fase 1)

### 3.6 `notifications` — Notificaciones

- Centro de notificaciones in-app.
- Configuración por usuario (qué notificaciones recibir).
- Multi-canal (in-app, email, push en Fase 2).
- **Prioridad:** P1 (Fase 1)

### 3.7 `audit` — Auditoría

- Log de acciones sensibles.
- Filtros por usuario, módulo, tipo, rango de fechas.
- Retención configurable por plan (90 días base, 1 año en Business).
- **Prioridad:** P1 (Fase 1)

### 3.8 `files` — Gestión de archivos

- Upload/download de archivos a R2.
- Explorador básico.
- Adjuntar a entidades de otros módulos.
- Miniatura para imágenes.
- **Prioridad:** P1 (Fase 1)

### 3.9 `reports` — Reportes base

- Motor común para generar reportes exportables (PDF, CSV, Excel).
- Los demás módulos declaran templates de reportes que este motor renderiza.
- **Prioridad:** P2 (Fase 2)

### 3.10 `settings` — Configuraciones generales

- Página unificada de settings.
- Sub-secciones aportadas por otros módulos (cada módulo puede aportar su sección).
- **Prioridad:** P0 (Fase 1)

---

## 4. Módulos Business (transversales)

Módulos aplicables a múltiples rubros. La mayoría de tenants activarán varios de estos.

### 4.1 Ventas y CRM

#### `crm` — CRM
- Contactos (personas y empresas).
- Oportunidades (deals) con pipeline configurable por etapas.
- Historial de interacciones.
- Etiquetas y segmentación.
- Vista Kanban del pipeline.
- Importación desde CSV.
- **Aplicable a:** todos los rubros.
- **Estado:** planned | **Prioridad:** P0 (primer módulo de Fase 1)

#### `quotes` — Cotizaciones
- Generación de cotizaciones a partir de contactos y catálogo.
- Templates de cotización personalizables con branding.
- Envío por email con tracking (abierto / no abierto).
- Conversión a orden de venta o factura.
- **Depende de:** `crm`, `catalog` (o productos manuales).
- **Estado:** planned | **Prioridad:** P2

#### `sales_orders` — Órdenes de venta
- Pipeline post-cotización.
- Estados: pendiente, en preparación, enviado, entregado.
- Integrable con `stock` y `shipping`.
- **Estado:** planned | **Prioridad:** P3

### 4.2 Facturación y finanzas

#### `invoicing` — Facturación
- Generación de facturas con branding.
- Numeración configurable.
- Estados: borrador, emitida, pagada, vencida, anulada.
- Recordatorios de pago automáticos.
- **Estado:** planned | **Prioridad:** P1 (Fase 2)

#### `invoicing_ar` — Facturación electrónica AR (AFIP)
- Extensión de `invoicing` para Argentina.
- Emisión de facturas A, B, C, E vía webservice AFIP.
- CUIT, condiciones frente al IVA.
- **Depende de:** `invoicing`.
- **Estado:** planned | **Prioridad:** P2 (diferencial LATAM importante)

#### `invoicing_mx` — Facturación electrónica MX (CFDI)
- Emisión de CFDI 4.0 vía PAC.
- **Estado:** ideation

#### `payments` — Pagos y cobros
- Registro de pagos recibidos.
- Vinculación a facturas.
- Métodos: efectivo, transferencia, tarjeta.
- Integración con `payments_mercadopago` y `payments_stripe`.
- Cuentas por cobrar.
- **Estado:** planned | **Prioridad:** P2

#### `expenses` — Gastos
- Carga de gastos con adjunto de comprobante.
- Categorías de gasto.
- Aprobación por manager (workflow).
- OCR de tickets (Fase 3, con `ai`).
- **Estado:** planned | **Prioridad:** P3

#### `accounts_receivable` — Cuentas por cobrar
- Vista de deuda por cliente.
- Aging report.
- Recordatorios automáticos configurables.
- **Estado:** planned | **Prioridad:** P3

#### `accounts_payable` — Cuentas por pagar
- Deudas con proveedores.
- Agenda de vencimientos.
- **Estado:** planned | **Prioridad:** P4

#### `bank_reconciliation` — Conciliación bancaria
- Importación de extractos bancarios (CSV / OFX).
- Match automático con pagos registrados.
- **Estado:** ideation

### 4.3 Operaciones e inventario

#### `catalog` — Catálogo de productos y servicios
- Productos con SKU, precios, imágenes.
- Servicios con duración.
- Categorías y atributos.
- Precios por lista.
- **Estado:** planned | **Prioridad:** P1

#### `stock` — Inventario
- Stock actual por producto y depósito.
- Movimientos (entrada, salida, ajuste, transferencia).
- Alertas de stock mínimo.
- Múltiples depósitos.
- Números de serie / lotes (opcional).
- **Depende de:** `catalog`.
- **Estado:** planned | **Prioridad:** P2

#### `suppliers` — Proveedores
- Contactos de proveedores.
- Órdenes de compra.
- Historial de compras.
- **Estado:** planned | **Prioridad:** P3

#### `purchases` — Compras
- Órdenes de compra a proveedores.
- Recepción de mercadería (impacta stock).
- **Depende de:** `suppliers`, `stock`.
- **Estado:** planned | **Prioridad:** P3

#### `pos` — Punto de venta
- Interfaz optimizada para ventas presenciales.
- Modo offline básico.
- Impresión de tickets.
- Múltiples cajas.
- Corte de caja.
- **Depende de:** `catalog`, `stock`, `payments`.
- **Estado:** planned | **Prioridad:** P3

#### `shipping` — Envíos y despachos
- Preparación de pedidos.
- Etiquetas de envío.
- Integración con correos (OCA, Andreani, DHL — Fase 4).
- **Estado:** ideation

### 4.4 Agenda y recursos

#### `scheduling` — Agenda y turnos
- Vista día / semana / mes.
- Asignación por profesional o recurso.
- Estados de cita (pendiente, confirmada, completada, no-show, cancelada).
- Bloqueos y disponibilidad configurable.
- Recordatorios automáticos.
- **Estado:** planned | **Prioridad:** P1 (Fase 2)

#### `public_booking` — Reservas públicas
- Página pública para que clientes finales reserven turnos.
- URL: `estudiokinesio.miapp.com/reservar`.
- Configuración de servicios, duración, profesionales visibles.
- Confirmación por email al cliente.
- **Depende de:** `scheduling`, `branding`.
- **Estado:** planned | **Prioridad:** P2 (feature muy vendible para servicios)

#### `resources` — Recursos y salas
- Reserva de salas, equipos, vehículos.
- Calendario por recurso.
- Choque de reservas detectado.
- **Estado:** planned | **Prioridad:** P4

### 4.5 Recursos humanos

#### `employees` — Empleados
- Legajos.
- Puestos, áreas, jerarquía.
- Documentos adjuntos.
- **Estado:** planned | **Prioridad:** P2

#### `attendance` — Asistencia
- Registro de entrada/salida.
- Web + app móvil (o QR + PWA).
- Geolocalización opcional.
- Reportes de horas.
- **Depende de:** `employees`.
- **Estado:** planned | **Prioridad:** P2 (mencionado como caso original del kinesiólogo)

#### `time_off` — Ausencias y vacaciones
- Solicitudes de vacaciones, licencias.
- Aprobación por manager.
- Saldo de días.
- **Depende de:** `employees`.
- **Estado:** planned | **Prioridad:** P3

#### `payroll_basic` — Liquidación de sueldos básica
- Cálculo simple de haberes.
- Recibos de sueldo con branding.
- **NO** reemplaza a un sistema de liquidación profesional. Es para pymes muy chicas.
- **Estado:** ideation

#### `performance` — Evaluaciones de desempeño
- Ciclos de evaluación.
- Objetivos (OKRs simples).
- Feedback 360.
- **Estado:** ideation

### 4.6 Proyectos y tareas

#### `tasks` — Tareas
- Lista de tareas con asignados, fechas, prioridad.
- Vista lista y Kanban.
- Sub-tareas.
- Etiquetas.
- **Estado:** planned | **Prioridad:** P2

#### `projects` — Gestión de proyectos
- Proyectos con tareas agrupadas.
- Milestones.
- Gantt básico.
- Vinculable a `crm` (proyecto para un cliente).
- **Depende de:** `tasks`.
- **Estado:** planned | **Prioridad:** P3

#### `time_tracking` — Registro de tiempo
- Tracker por tarea o proyecto.
- Reportes de horas por persona/proyecto.
- Facturable/no facturable.
- Integrable con `invoicing` para facturar horas.
- **Estado:** planned | **Prioridad:** P3

### 4.7 Atención al cliente

#### `tickets` — Tickets de soporte
- Inbox de tickets.
- Estados, prioridades, asignaciones.
- SLA básico.
- Conversación por ticket.
- Integrable con `crm` (ticket asociado a contacto).
- **Estado:** planned | **Prioridad:** P3

#### `live_chat` — Chat en vivo
- Widget embebible en sitio del tenant.
- Bandeja de entrada para operadores.
- Historial por visitante.
- Integrable con `ai_chatbot_public` para bot 24/7.
- **Estado:** planned | **Prioridad:** P4

#### `satisfaction` — Encuestas de satisfacción
- NPS, CSAT.
- Envío automático post-interacción.
- **Estado:** ideation

### 4.8 Marketing

#### `forms` — Formularios y captación
- Constructor de formularios.
- Embebibles en sitios externos.
- Genera contactos en CRM.
- **Depende de:** `crm`.
- **Estado:** planned | **Prioridad:** P3

#### `email_campaigns` — Email marketing
- Campañas a segmentos del CRM.
- Templates con branding.
- Métricas de apertura y clic.
- **Depende de:** `crm`.
- **Estado:** planned | **Prioridad:** P4

#### `whatsapp_broadcast` — Difusión WhatsApp
- Envío masivo por WhatsApp Business API.
- Templates aprobados por Meta.
- **Depende de:** `integration_whatsapp`.
- **Estado:** planned | **Prioridad:** P3 (LATAM alto valor)

#### `landing_pages` — Landings simples
- Constructor de landings públicas bajo el subdominio del tenant.
- Templates.
- Integración con `forms` para captación.
- **Estado:** ideation

### 4.9 Analytics

#### `analytics_basic` — Analytics básico
- Dashboards por módulo (incluidos en cada módulo).
- **Ya viene con cada módulo, no es un módulo aparte.**

#### `analytics_custom` — Constructor de dashboards
- Widgets configurables.
- Consultas guardadas.
- Comparativas por período.
- **Estado:** planned | **Prioridad:** P4

#### `data_export` — Export avanzado
- Programación de exports periódicos.
- Envío por email o a Google Drive.
- **Estado:** ideation

---

## 5. Módulos Verticales (por rubro)

Estos son composiciones + funcionalidad específica que resuelven completamente un rubro. Suelen depender de varios módulos transversales.

### 5.1 Salud y bienestar

#### `vertical_kinesiologia` — Kinesiología y fisioterapia
- Historia clínica del paciente (ficha kinésica, evaluación funcional).
- Sesiones con evolución.
- Prescripción de ejercicios (con imágenes/video).
- Consentimientos informados.
- **Depende de:** `crm`, `scheduling`, `files`, `attendance`.
- **Estado:** planned | **Prioridad:** P1 (rubro que ya conocés, buen segundo vertical)

#### `vertical_consultorio_medico` — Consultorio médico
- Historia clínica general.
- Prescripciones digitales.
- Turnos con confirmación.
- Recordatorios.
- **Estado:** planned | **Prioridad:** P2

#### `vertical_psicologia` — Psicología / terapia
- Fichas de paciente con notas de sesión.
- Consentimientos.
- Turnos recurrentes.
- Facturación por sesión.
- **Estado:** planned | **Prioridad:** P3

#### `vertical_gimnasio` — Gimnasios y estudios fitness
- Membresías (mensual, anual, pack de clases).
- Reserva de clases con cupo.
- Check-in por QR.
- Renovaciones automáticas.
- **Estado:** planned | **Prioridad:** P2

#### `vertical_nutricion` — Nutricionistas
- Fichas antropométricas.
- Planes alimentarios exportables como PDF con branding.
- Seguimiento por período.
- **Estado:** ideation

### 5.2 Belleza y estética

#### `vertical_peluqueria` — Peluquerías y barberías
- Servicios con duración por profesional.
- Comisiones por profesional.
- Ficha de cliente con historial de servicios.
- Ventas de productos.
- **Depende de:** `scheduling`, `pos`, `catalog`.
- **Estado:** planned | **Prioridad:** P2

#### `vertical_spa` — Spa y estética
- Similar a peluquería pero con salas/cabinas como recurso.
- Bonos y paquetes.
- **Estado:** planned | **Prioridad:** P3

### 5.3 Servicios profesionales

#### `vertical_estudio_juridico` — Estudios jurídicos
- Casos con estados, contraparte, materia.
- Vencimientos judiciales.
- Documentos por caso.
- Facturación por hora o por caso.
- **Estado:** planned | **Prioridad:** P3

#### `vertical_estudio_contable` — Estudios contables
- Clientes con datos fiscales.
- Vencimientos impositivos.
- Solicitud de documentación al cliente (portal cliente).
- **Estado:** planned | **Prioridad:** P3

#### `vertical_arquitectura` — Estudios de arquitectura
- Proyectos con etapas.
- Presupuestos por obra.
- Documentos técnicos.
- **Estado:** ideation

#### `vertical_consultoria` — Consultoría
- Proyectos con horas facturables.
- Reporte de utilización.
- **Depende de:** `projects`, `time_tracking`, `invoicing`.
- **Estado:** planned | **Prioridad:** P3

### 5.4 Retail y comercios

#### `vertical_retail` — Comercio minorista
- Composición de `catalog` + `stock` + `pos` + `invoicing`.
- E-commerce embebido opcional.
- **Estado:** planned | **Prioridad:** P2

#### `vertical_gastronomia` — Restaurantes y bares
- Mesas y mozos.
- Menú digital con QR.
- Comanda a cocina (impresora térmica o pantalla).
- Modificadores de plato.
- Split de cuenta.
- **Estado:** planned | **Prioridad:** P3

#### `vertical_delivery` — Delivery propio
- Pedidos con estado en vivo.
- Asignación a repartidores.
- Tracking para el cliente final.
- **Estado:** ideation

### 5.5 Educación

#### `vertical_escuela` — Escuelas e institutos
- Alumnos, cursos, docentes.
- Asistencias.
- Notas y boletines.
- Comunicación con padres.
- Cobro de cuotas.
- **Estado:** planned | **Prioridad:** P3

#### `vertical_academia` — Academias y cursos particulares
- Cursos con inscripciones.
- Pagos por curso o mensuales.
- Certificados.
- **Estado:** planned | **Prioridad:** P3

### 5.6 Inmobiliario

#### `vertical_inmobiliaria` — Inmobiliarias
- Fichas de propiedad (venta / alquiler).
- Fotos, planos, ubicación.
- Publicación en portales (integraciones).
- Interesados vinculados desde CRM.
- Visitas agendables.
- **Estado:** planned | **Prioridad:** P3

#### `vertical_alquiler_temporario` — Alquiler temporario
- Calendario de disponibilidad por propiedad.
- Reservas y pagos.
- Integración con Airbnb / Booking (Fase 4).
- **Estado:** ideation

### 5.7 Servicios técnicos

#### `vertical_taller_mecanico` — Talleres mecánicos
- Ficha de vehículo por cliente.
- Órdenes de trabajo.
- Presupuestos con mano de obra + repuestos.
- Historial de servicios.
- **Depende de:** `crm`, `catalog`, `stock`, `invoicing`.
- **Estado:** planned | **Prioridad:** P3

#### `vertical_service_electronica` — Service técnico
- Ingreso de equipos, diagnóstico, presupuesto, aprobación, reparación, entrega.
- Estados con notificación al cliente.
- **Estado:** planned | **Prioridad:** P3

#### `vertical_construccion` — Constructoras y contratistas
- Obras.
- Presupuestos por rubro (materiales, mano de obra).
- Certificaciones de avance.
- **Estado:** ideation

### 5.8 Otros

#### `vertical_eventos` — Organización de eventos
- Eventos con fecha, capacidad, entradas.
- Venta online de tickets.
- Check-in por QR.
- **Estado:** ideation

#### `vertical_transporte` — Transporte y logística
- Rutas.
- Flota.
- Órdenes de entrega.
- Tracking.
- **Estado:** ideation

#### `vertical_agencia_marketing` — Agencia de marketing/diseño
- Proyectos por cliente.
- Aprobaciones (drive de archivos con feedback).
- Horas facturables.
- **Estado:** ideation

#### `vertical_freelancer` — Freelancers individuales
- Versión ultra-simplificada.
- Clientes, proyectos, facturación, cobros.
- Plan de precio muy bajo.
- **Estado:** planned | **Prioridad:** P4 (segmento grande LATAM)

---

## 6. Módulos de Integraciones

Cada uno es una conexión con un servicio externo. Se activan por tenant, con sus credenciales.

### 6.1 Comunicación

- `integration_whatsapp` — WhatsApp Business API (via Twilio, Meta Cloud API o 360dialog). **P1 LATAM.**
- `integration_email_gmail` — Envío desde Gmail del tenant. P3.
- `integration_email_outlook` — Idem Outlook. P4.
- `integration_sms_twilio` — SMS. P4.
- `integration_telegram` — Bot de Telegram para notificaciones. P4.

### 6.2 Pagos

- `integration_stripe` — Cobros con Stripe. P1.
- `integration_mercadopago` — Cobros con MercadoPago. **P1 LATAM.**
- `integration_transferencia` — Registro de transferencias manual. P2.

### 6.3 Calendarios

- `integration_google_calendar` — Sincronización bidireccional con Google Calendar del profesional. P2.
- `integration_outlook_calendar` — Idem Outlook. P4.

### 6.4 Storage y documentos

- `integration_google_drive` — Adjuntar archivos desde Drive del tenant. P3.
- `integration_dropbox` — Idem Dropbox. P4.

### 6.5 Contabilidad y facturación externa

- `integration_afip` — Facturación electrónica AR. Ya listado como `invoicing_ar`.
- `integration_contabilium` — Sync con Contabilium. P4.
- `integration_tango` — Sync con Tango Gestión. P4.

### 6.6 Marketing y CRM

- `integration_mailchimp` — Sync contactos ↔ listas Mailchimp. P4.
- `integration_meta_ads` — Lead ads de Facebook/Instagram → CRM. P3.
- `integration_google_ads` — Idem Google Ads. P4.

### 6.7 E-commerce

- `integration_tiendanube` — Sync catálogo y pedidos. **P2 LATAM.**
- `integration_shopify` — Sync catálogo y pedidos. P3.
- `integration_mercadolibre` — Publicación y sync con ML. P3.

### 6.8 Portales inmobiliarios

- `integration_zonaprop`, `integration_argenprop` — Publicación automática. P4.

### 6.9 Automatización

- `integration_n8n` — Habilita webhooks y credenciales para n8n del tenant. **P1 (Fase 3).**
- `integration_zapier` — Alternativa. P4.
- `integration_make` — Alternativa. P4.

---

## 7. Módulos de IA

### 7.1 `ai_assistant_internal` — Asistente IA interno

- Chat en la app para el staff del tenant.
- Ejecuta acciones sobre los módulos activos.
- Usa Claude Sonnet.
- Facturado por mensajes/tokens.
- **Estado:** planned | **Prioridad:** P0 (Fase 3, diferencial principal)

### 7.2 `ai_chatbot_public` — Chatbot público

- Widget embebible en sitio del tenant o dentro de WhatsApp.
- Responde preguntas, agenda turnos, consulta stock.
- Usa Claude Haiku.
- Con RAG del tenant (`ai_rag`).
- **Estado:** planned | **Prioridad:** P1 (Fase 3)

### 7.3 `ai_rag` — Base de conocimiento con IA

- Tenant sube documentos (políticas, catálogos, FAQs).
- Se indexan con embeddings (pgvector).
- Consultables desde chatbot interno y público.
- **Estado:** planned | **Prioridad:** P2 (Fase 3)

### 7.4 `ai_email_drafts` — Redacción asistida de emails

- Botón "generar respuesta" en emails y mensajes.
- Tono configurable.
- **Estado:** planned | **Prioridad:** P3

### 7.5 `ai_document_gen` — Generación de documentos

- Templates (cotizaciones, contratos, presupuestos).
- Completado con contexto del tenant y del destinatario.
- **Estado:** planned | **Prioridad:** P3

### 7.6 `ai_ocr_receipts` — OCR de comprobantes

- Subís foto de un ticket → extrae datos → carga como gasto.
- Usa vision de Claude.
- **Depende de:** `expenses`.
- **Estado:** ideation

### 7.7 `ai_lead_scoring` — Scoring de leads

- Analiza contactos y deals del CRM.
- Puntúa probabilidad de conversión.
- Sugiere próximas acciones.
- **Depende de:** `crm`.
- **Estado:** ideation

### 7.8 `ai_call_transcripts` — Transcripción de llamadas

- Sube audio → transcribe → resume → guarda en el contacto.
- **Estado:** ideation

---

## 8. Cómo crear un nuevo módulo

### 8.1 Antes de empezar

Preguntas obligatorias a responder:

1. **¿Qué problema resuelve?** Frase en una línea, específica.
2. **¿A qué rubros aplica?** Si es a uno solo, va en verticales. Si aplica a varios, es transversal.
3. **¿Depende de otros módulos?** Listalos.
4. **¿Qué recursos maneja?** (Ej: contactos, productos, citas). Cada uno será una entidad.
5. **¿Qué eventos emite?** (Ej: `crm.deal.won`). Estos alimentan auditoría, IA y n8n.
6. **¿Qué acciones puede hacer la IA sobre este módulo?** (Ej: buscar, crear, actualizar entidades).
7. **¿Cómo se factura?** ¿Va con el plan base o es add-on?

### 8.2 Checklist de creación

1. [ ] Correr el generador: `pnpm module:new <nombre>`.
2. [ ] Escribir el `manifest.ts` completo.
3. [ ] Diseñar el schema Prisma del módulo (recordar `tenantId` en todas las tablas).
4. [ ] Crear migración: `pnpm db:migrate:dev --name add-<modulo>`.
5. [ ] Agregar políticas RLS en migración manual: `pnpm db:rls:create <tabla>`.
6. [ ] Implementar routers tRPC en `api/`.
7. [ ] Escribir validaciones Zod.
8. [ ] Declarar y registrar permisos en `permissions.ts`.
9. [ ] Implementar UI:
   - [ ] Páginas principales.
   - [ ] Componentes de widget para dashboard global (si aplica).
10. [ ] Declarar `aiActions` con handlers.
11. [ ] Emitir eventos en operaciones clave.
12. [ ] Crear `seed.ts` con datos demo realistas.
13. [ ] Escribir tests: routers, permisos, aislamiento entre tenants.
14. [ ] Documentar en `packages/modules/<nombre>/README.md`.
15. [ ] Agregar entrada en `MODULES.md`.
16. [ ] Registrar el módulo en `packages/modules-sdk/index.ts`.
17. [ ] Preview del módulo en app admin.
18. [ ] Screenshots para el marketplace.

### 8.3 Anti-patterns a evitar

- ❌ Importar tablas de otro módulo directamente (usar eventos o interfaces del SDK).
- ❌ Hardcodear un rubro en un módulo transversal.
- ❌ Consultar datos sin filtro de tenant (siempre confiar en RLS + Prisma middleware).
- ❌ Crear campos "genéricos" tipo `data: Json` que terminan siendo un cajón de sastre. Mejor tabla explícita.
- ❌ Módulos que hacen 5 cosas distintas. Partirlos en 5 módulos que se combinan.
- ❌ Copy-paste entre módulos. Extraer a `packages/utils` o al SDK.

### 8.4 Cuándo NO crear un módulo

- Si es funcionalidad transversal que aplica a TODO tenant (ej: comentarios en cualquier entidad) → va en el SDK, no como módulo.
- Si es una integración muy pequeña (< 100 líneas) → agrupá varias en un módulo `integration_pack_xxx`.
- Si es un feature del plan (ej: soporte prioritario) → feature flag, no módulo.

---

## 9. Matriz módulo × rubro

Esta matriz sugiere qué módulos activar por defecto en el onboarding según el rubro elegido. Es la base del "onboarding inteligente".

| Rubro | Vertical | Transversales sugeridos |
|-------|----------|------------------------|
| Kinesiología | `vertical_kinesiologia` | crm, scheduling, invoicing, whatsapp, mercadopago |
| Consultorio médico | `vertical_consultorio_medico` | crm, scheduling, invoicing, whatsapp |
| Psicología | `vertical_psicologia` | crm, scheduling, invoicing, whatsapp |
| Gimnasio | `vertical_gimnasio` | scheduling, catalog, payments, whatsapp |
| Peluquería / barbería | `vertical_peluqueria` | scheduling, catalog, pos, invoicing, whatsapp |
| Spa | `vertical_spa` | scheduling, catalog, invoicing |
| Estudio jurídico | `vertical_estudio_juridico` | crm, tasks, invoicing, files |
| Estudio contable | `vertical_estudio_contable` | crm, tasks, invoicing, files |
| Retail / almacén | `vertical_retail` | catalog, stock, pos, invoicing, suppliers |
| Restaurante | `vertical_gastronomia` | catalog, pos, stock |
| Escuela | `vertical_escuela` | crm, payments, whatsapp |
| Inmobiliaria | `vertical_inmobiliaria` | crm, scheduling, files |
| Taller mecánico | `vertical_taller_mecanico` | crm, catalog, stock, invoicing |
| Freelancer | `vertical_freelancer` | crm, invoicing, tasks, time_tracking |
| Consultoría | `vertical_consultoria` | crm, projects, tasks, time_tracking, invoicing |
| Genérico / otro | (ninguno) | crm, tasks, invoicing (el usuario elige después) |

---

## 10. Priorización

### 10.1 Criterios

Cada módulo tiene una prioridad P0 a P4:

- **P0** — Debe existir para que la plataforma sea utilizable.
- **P1** — Necesario para el MVP vendible.
- **P2** — Necesario para expansión de mercado.
- **P3** — Nice to have, roadmap medio plazo.
- **P4** — Explorable después de tracción.

### 10.2 Orden sugerido de construcción

**Fase 1 (MVP):**
1. Todos los módulos `core` (P0)
2. `crm` (primer transversal completo, prueba el patrón)

**Fase 2 (Comercialización básica):**
3. `catalog`
4. `scheduling`
5. `invoicing` + `payments`
6. `integration_stripe` + `integration_mercadopago`
7. `vertical_kinesiologia` (primer vertical, valida el modelo de composición)

**Fase 3 (IA + diferenciación):**
8. `ai_assistant_internal`
9. `integration_n8n`
10. `integration_whatsapp`
11. `public_booking`
12. `stock`
13. `attendance`
14. `ai_chatbot_public`

**Fase 4 (Expansión):**
15. Más verticales según demanda real de clientes.
16. Más integraciones según demanda.
17. `analytics_custom`, marketplace, dominios custom.

### 10.3 Regla de oro para el roadmap

**No construyas un módulo hasta que un cliente potencial lo pida.** Después de Fase 2 (MVP + primer vertical + billing), el orden lo dicta el mercado, no vos.

---

## Anexo A — Ideas para el futuro (parking lot)

Cosas que suenan interesantes pero no están priorizadas:

- Módulo de encuestas internas / clima laboral.
- Módulo de wiki / knowledge base interna.
- Módulo de OKRs / objetivos.
- Módulo de gastos con tarjetas corporativas.
- Módulo de reembolsos.
- Módulo de firma digital de documentos.
- Módulo de referidos.
- Módulo de programa de fidelidad para clientes finales.
- App móvil para clientes del tenant (white-labeled).
- API pública para que el tenant integre desde afuera.
- Módulo de portal cliente (donde el cliente final del tenant se loguea).

---

## Anexo B — Cómo priorizar un módulo nuevo

Cuando entra un pedido:

1. ¿Cuántos clientes lo pidieron? (Si es 1, esperar.)
2. ¿Cuánto MRR habilita? (¿Se vende sin él?)
3. ¿Cuánto tiempo cuesta? (Escala 1-13 tipo Fibonacci.)
4. ¿Encaja con la visión de plataforma? (Si es hyper-específico de un solo cliente, quizás no.)
5. Score = (clientes × MRR) / tiempo, ordenar por score.

---

**Cierre:** este catálogo va a evolucionar con el negocio. Revisalo trimestralmente y actualizá prioridades según feedback real de clientes.
