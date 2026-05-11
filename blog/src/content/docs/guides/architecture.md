---
title: Arquitectura
---

ALIVIA está diseñada con una arquitectura por capas que separa la experiencia del usuario, la lógica de negocio, el almacenamiento de datos y el registro en blockchain.

## Flujo de un voto

```
Votante → Verificación de identidad (IA) → Emisión del voto (cifrado E2E)
       → Registro en Syscoin NEVM (transacción inmutable)
       → Verificación pública (explorador de bloques)
```

## Capas del sistema

### Interfaz de usuario
Aplicación web moderna, accesible desde cualquier dispositivo. Diseño responsive con soporte para modo oscuro, optimizada para facilitar la participación electoral.

### Lógica de aplicación
API segura con autenticación JWT, verificación de identidad y gestión de elecciones. Todas las comunicaciones están protegidas con TLS 1.3.

### Almacenamiento
Base de datos relacional para gestión de usuarios, elecciones y configuración. Los votos en sí **no se almacenan en la base de datos** — se registran directamente en la blockchain.

### Blockchain (Syscoin NEVM)
Capa de registro inmutable. Cada voto se cifra y se registra como una transacción en Syscoin NEVM, una blockchain compatible con Ethereum que hereda la seguridad de Bitcoin mediante merge-mining.

## Seguridad por capas

| Capa | Protección |
|---|---|
| Identidad | Verificación biométrica con IA + documento |
| Transporte | TLS 1.3 con certificados wildcard |
| Voto | Cifrado E2E + Zero-Knowledge Proofs |
| Registro | Blockchain con merge-mining de Bitcoin |
| Auditoría | Explorador de bloques público + reportes de IA |

## Ventajas de Syscoin NEVM

- **Seguridad**: Hashrate compartido con Bitcoin (la red más segura del mundo)
- **Costo**: < $0.01 USD por transacción
- **Velocidad**: Finality en ~5 segundos
- **Compatibilidad**: Smart contracts en Solidity (ecosistema Ethereum)
- **Escalabilidad**: 1,000+ transacciones por segundo

Más información sobre Syscoin: [syscoin.org](https://syscoin.org)
