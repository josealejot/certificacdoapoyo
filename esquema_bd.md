# Esquema de Base de Datos Firestore - Plataforma Certificados MAE

Sistema clínico para evaluación, seguimiento y expedición de Certificados de Mascota de Apoyo Emocional (MAE) bajo el marco normativo colombiano (**Ley 1090 de 2006** y **Resolución 1995 de 1999** sobre archivo de Historias Clínicas).

---

## 1. Colección: `pacientes`
Almacena el perfil demográfico y de contacto del paciente (titular del animal de soporte).

- **Document ID**: `pacienteId` (UUID o Firebase Auth UID)
- **Campos**:
  - `id`: `string`
  - `nombres`: `string`
  - `apellidos`: `string`
  - `tipoDocumento`: `string` (`CC`, `CE`, `PAS`)
  - `numeroDocumento`: `string`
  - `fechaNacimiento`: `string` (ISO 8601: `YYYY-MM-DD`)
  - `edad`: `number`
  - `ocupacion`: `string`
  - `telefono`: `string`
  - `email`: `string`
  - `ciudad`: `string`
  - `direccion`: `string`
  - `createdAt`: `timestamp`
  - `updatedAt`: `timestamp`

---

## 2. Colección: `historias_clinicas`
Registro legal obligatorio de evolución psicológica, motivo de consulta, antecedentes y seguimiento clínico.

- **Document ID**: `historiaId` (UUID)
- **Campos**:
  - `id`: `string`
  - `pacienteId`: `string` (Referencia a `pacientes`)
  - `fechaApertura`: `timestamp`
  - `motivoConsulta`: `string`
  - `antecedentes`: `map`
    - `personales`: `string`
    - `familiares`: `string`
    - `psiquiatricos`: `string`
    - `farmacologicos`: `string`
  - `examenMental`: `map`
    - `porteActitud`: `string`
    - `concienciaAfecto`: `string`
    - `pensamientoJuicio`: `string`
  - `impresionDiagnosticaDSM5`: `array<string>` (Códigos DSM-5 / CIE-10/11)
  - `criterioApoyoEmocional`: `map`
    - `ameritaMAE`: `boolean`
    - `justificacionTerapeutica`: `string`
    - `vinculoHumanoAnimal`: `string`
  - `profesionalTratante`: `map`
    - `nombre`: `string` (Default: "José Alejandro Tangarife David")
    - `tarjetaProfesional`: `string` ("184919")
    - `rethus`: `string` ("Res. 5413719")
  - `estado`: `string` (`BORRADOR`, `FIRMADA`, `ARCHIVADA`)
  - `createdAt`: `timestamp`
  - `updatedAt`: `timestamp`

---

## 3. Colección: `evaluaciones_16pf`
Registro psicométrico estructurado para análisis de personalidad y factores primarios/secundarios de ansiedad y adaptación.

- **Document ID**: `evaluacionId` (UUID)
- **Campos**:
  - `id`: `string`
  - `pacienteId`: `string`
  - `historiaClinicaId`: `string`
  - `fechaAplicacion`: `timestamp`
  - `puntuacionesDirectas`: `map<string, number>` (Factores A - Q4)
  - `decanipos`: `map<string, number>` (Escala estandarizada 1 a 10)
    - `A`: `number` (Afectividad)
    - `B`: `number` (Razonamiento)
    - `C`: `number` (Estabilidad Emocional)
    - `E`: `number` (Dominancia)
    - `F`: `number` (Animación)
    - `G`: `number` (Atención a normas)
    - `H`: `number` (Atrevimiento)
    - `I`: `number` (Sensibilidad)
    - `L`: `number` (Vigilancia)
    - `M`: `number` (Abstracción)
    - `N`: `number` (Privacidad)
    - `O`: `number` (Aprensión)
    - `Q1`: `number` (Apertura al cambio)
    - `Q2`: `number` (Autosuficiencia)
    - `Q3`: `number` (Perfeccionismo)
    - `Q4`: `number` (Tensión)
  - `factoresSecundarios`: `map`
    - `ansiedad`: `number`
    - `extraversion`: `number`
    - `socializacion`: `number`
    - `independencia`: `number`
  - `sintomasReferidos`: `array<string>`
  - `analisisSinteticoIA`: `string` (Dictamen generado por LLM)
  - `createdAt`: `timestamp`

---

## 4. Colección: `certificados`
Documentos finales expedidos y verificables mediante código QR o hash único.

- **Document ID**: `codigoValidacion` (ej. `MAE-2026-XXXX`)
- **Campos**:
  - `id`: `string`
  - `codigoValidacion`: `string`
  - `pacienteId`: `string`
  - `historiaClinicaId`: `string`
  - `datosMascota`: `map`
    - `nombre`: `string`
    - `especie`: `string`
    - `raza`: `string`
    - `edad`: `string`
    - `microchip`: `string`
  - `fechaExpedicion`: `timestamp`
  - `fechaVencimiento`: `timestamp` (Generalmente 1 año de vigencia)
  - `pdfUrl`: `string`
  - `hashIntegridad`: `string` (SHA-256)
  - `estado`: `string` (`VIGENTE`, `REVOCADO`, `VENCIDO`)
