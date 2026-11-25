# PROJECT IDENTITY — ELEVATE Experience

**Versión:** 1.0 · **Fecha:** 2026-11-25 · **Gobernanza:** [KISS v1.0](KISS_PROTOCOL.md) · [SINR v1.0](SINR_PROTOCOL.md)
Este archivo no contiene secretos, contraseñas ni credenciales. `UNKNOWN` marca datos que el Product Owner debe confirmar antes de cualquier acción que dependa de ellos (Framework §12).

## 1. Identidad
| Campo | Valor |
|---|---|
| Nombre del proyecto | ELEVATE Experience |
| Identificador único | **UNKNOWN (pendiente de asignar por el Product Owner)** |
| Product Owner | Luigi Hernandez (Northern South Ventures) |
| Organización de GitHub | `luigihofficial` |
| Repositorio oficial | `luigihofficial/elevate-experience`. Rama base: `main` |
| Finalidad | Landing, registro y venta de entradas del evento ELEVATE Experience (5 de septiembre de 2026, Miami). |

## 2. Infraestructura autorizada
| Servicio | Recurso | Uso |
|---|---|---|
| Vercel | Proyecto que sirve `elevate-experience-smoky.vercel.app` (ID: UNKNOWN) | Sitio y funciones `api/*` |
| Stripe | UNKNOWN | Checkout de entradas |
| Resend | UNKNOWN | Envío de entradas |

Las credenciales viven solo en las variables de entorno del proveedor y en los secretos de GitHub, nunca en el repositorio ni en el chat.

## 3. Entornos autorizados
| Entorno | Regla |
|---|---|
| Producción (Vercel) | Despliegue automático al hacer push a `main`. Cualquier cambio requiere autorización del Product Owner |

## 4. Dominios autorizados
- `elevate-experience-smoky.vercel.app`

## 5. Límites operativos
- Sin merge, despliegues, cambios en producción, migraciones, SQL de escritura ni gastos sin autorización explícita del Product Owner, vinculada a este proyecto, entorno y recurso.
- El evento ya ocurrió: tratar el repositorio como de baja actividad y no reactivar pagos sin autorización.
- Titularidad del proyecto (NSV o tercero): UNKNOWN, pendiente de confirmar por el Product Owner.
- Este repositorio no comparte código, datos, credenciales, backlogs ni autorizaciones con otros proyectos de NSV (SINR §11).
