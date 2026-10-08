# Plataforma Clínica de Certificados MAE Colombia
### Sistema de Evaluación Psicológica y Expedición de Certificados de Mascota de Apoyo Emocional (Ley 1090 de 2006)

---

## Constantes del Profesional Responsable
- **Profesional:** José Alejandro Tangarife David
- **Título:** Psicólogo Clínico | Especialista en Seguridad y Salud en el Trabajo
- **Acreditación:** Tarjeta Profesional Colpsic 184919 | RETHUS Res. 5413719

---

## Estructura del Monorepo

```
certificados-apoyoemocional/
├── frontend/                     # React + Vite + Tailwind CSS (Feature-based)
│   ├── src/
│   │   ├── features/
│   │   │   ├── pacientes/
│   │   │   ├── evaluacion/
│   │   │   └── certificados/
│   │   └── services/
│   │       └── api.js            # Axios con interceptores Firebase Auth
├── backend-core/                 # Java 17 + Spring Boot (Clean Architecture)
│   ├── src/main/java/com/mae/core/
│   │   ├── domain/               # Entidades (Paciente, HistoriaClinica), Value Objects, Repositorios
│   │   ├── application/          # Casos de uso y DTOs
│   │   └── infrastructure/       # Firestore Firebase Admin SDK, Controladores REST
├── backend-ia-pdf/               # Python 3.10+ + FastAPI
│   ├── app/
│   │   ├── core/config.py        # Constantes del profesional inyectadas
│   │   └── services/
│   │       └── generador_pdf.py  # FPDF2 con membrete legal Ley 1090 y pie de página
│   ├── main.py                   # Endpoint POST /generar-dictamen (16PF + DSM-5)
│   └── requirements.txt
├── firestore.rules               # Reglas de seguridad estrictas Firestore
└── esquema_bd.md                 # Documentación técnica de colecciones
```
