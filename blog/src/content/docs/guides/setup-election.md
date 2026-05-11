---
title: Configurar una votación
---

## Crear una elección

(Sección en desarrollo — la interfaz de administración de votaciones estará disponible próximamente.)

## Roles

- **Administrador**: Crea y gestiona elecciones, define censo electoral, visualiza resultados.
- **Votante**: Participa en elecciones habilitadas, verifica su voto.
- **Auditor**: Revisa la integridad del proceso vía explorador de bloques.

## Flujo

1. El administrador define la elección (título, opciones, fechas, censo).
2. Los votantes reciben credenciales de acceso.
3. Cada votante emite su voto en la plataforma.
4. El voto se cifra y registra en Syscoin NEVM.
5. Al cierre, los resultados se computan automáticamente.
6. Cualquier persona puede auditar usando el explorador de bloques.
