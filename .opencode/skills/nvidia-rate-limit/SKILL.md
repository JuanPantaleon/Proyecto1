---
name: nvidia-rate-limit
description: Maneja errores de rate limit HTTP 429 al utilizar modelos de NVIDIA en OpenCode. Reduce solicitudes innecesarias, espera entre reintentos y conserva el contexto de la tarea.
---

# NVIDIA Rate Limit

Cuando trabajes con modelos servidos por NVIDIA:

## HTTP 429

Si una herramienta o solicitud devuelve:

- `429`
- `Too Many Requests`
- `rate limit`
- `RateLimit`

no abandones la tarea inmediatamente.

### Comportamiento

1. Conserva el estado actual de la tarea.
2. No repitas inmediatamente la misma solicitud.
3. Espera aproximadamente 90 segundos antes de intentar nuevamente.
4. Si vuelve a producirse un 429, espera 120 segundos.
5. Si vuelve a producirse otro 429, espera 180 segundos.
6. Después de varios errores consecutivos, aumenta progresivamente el intervalo.
7. No cambies de modelo automáticamente salvo que el usuario lo haya solicitado.
8. No reinicies innecesariamente operaciones que ya se completaron.
9. Antes de repetir una operación, comprueba si el cambio anterior ya se realizó.

## Trabajo con código

Cuando una tarea implique modificar archivos:

- Comprueba primero el estado actual de los archivos.
- Evita realizar llamadas redundantes.
- Divide las tareas grandes en pasos razonables.
- Después de modificar código, verifica el resultado antes de repetir la operación.
- Mantén el contexto de la tarea aunque una solicitud individual falle.

## Importante

Un HTTP 429 normalmente indica un límite temporal del proveedor. No significa necesariamente que el modelo, la API key o el proyecto estén configurados incorrectamente.

No cambies las credenciales ni el proveedor únicamente debido a un HTTP 429.