---
title: ¿Qué es ALIVIA? Votación digital con Blockchain e IA
date: 2025-05-10
tags: ["alivia", "blockchain", "votacion", "syscoin"]
authors: ["alivia"]
description: Conoce ALIVIA, la plataforma de votación digital que combina Blockchain Syscoin con Inteligencia Artificial para elecciones seguras y transparentes.
---

ALIVIA es una plataforma de votación digital de código abierto construida sobre **Syscoin NEVM** (blockchain compatible con Ethereum con merge-mining de Bitcoin) e **Inteligencia Artificial** para verificación de identidad y detección de anomalías.

## ¿Por qué otra plataforma de votación?

Los sistemas de votación tradicionales enfrentan problemas de:
- **Transparencia**: Dificultad para auditar resultados de forma independiente
- **Seguridad**: Vulnerabilidades en sistemas centralizados
- **Accesibilidad**: Barreras geográficas y tecnológicas para votantes

ALIVIA aborda estos problemas usando blockchain como capa de auditabilidad y descentralización.

## ¿Cómo funciona?

1. El votante se registra con verificación biométrica + documento de identidad
2. Emite su voto en una interfaz web segura
3. El voto se cifra de extremo a extremo
4. Se registra como transacción en Syscoin NEVM
5. Al finalizar, cualquiera puede auditar en el explorador de bloques

## Tecnología

| Componente | Descripción |
|---|---|
| **Syscoin NEVM** | Blockchain con merge-mining de Bitcoin, bajo costo (~$0.01/tx), finality en ~5s |
| **Wasp** | Framework full-stack que genera React + Node.js + Prisma |
| **PostgreSQL** | Base de datos relacional para datos de usuario y elecciones |
| **Docker** | Contenedores para despliegue reproducible |

## Estado actual

ALIVIA está en fase de desarrollo activo. El código es open-source y está disponible en [GitHub](https://github.com/BenjaminGhiggo/alivia).
