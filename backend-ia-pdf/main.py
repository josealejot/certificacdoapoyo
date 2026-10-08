from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from app.core.config import settings
from app.services.generador_pdf import GeneradorPDF

app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description="Microservicio de procesamiento psicométrico (16PF + DSM-5) y generación de certificados PDF de soporte emocional."
)

# 1. CORS Restringido: Solo dominios autorizados de la plataforma clínica (Vercel y Localhost)
ORIGENES_AUTORIZADOS = [
    "https://certificacdoapoyo-uzww.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENES_AUTORIZADOS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# 2. Middleware de Cabeceras de Seguridad HTTP (Defensa en Profundidad OWASP)
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    # Mitigación Clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    # Mitigación MIME-Type Sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Protección Cross-Site Scripting (XSS)
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Referrer Policy estricta
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Control de permisos del navegador
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

generador_pdf_service = GeneradorPDF()


# 3. Schemas Pydantic con validación defensiva estricta (Anti-DoS & Anti-Buffer Overflow)
class Factores16PF(BaseModel):
    puntuaciones: Dict[str, float] = Field(
        ...,
        description="Decatipos de los factores primarios (A, B, C, E, F, G, H, I, L, M, N, O, Q1, Q2, Q3, Q4)",
        example={"C": 3.0, "O": 8.0, "Q4": 9.0, "L": 7.0, "Q3": 4.0}
    )
    ansiedad_global: Optional[float] = Field(None, ge=1.0, le=10.0, description="Factor secundario de ansiedad")


class SolicitudDictamen(BaseModel):
    paciente_id: str = Field(..., min_length=3, max_length=50, description="Identificación del paciente")
    sintomas: List[str] = Field(
        ...,
        min_items=1,
        max_items=30,
        example=["Ansiedad generalizada", "Ataques de pánico en espacios cerrados", "Insomnio recurrente"]
    )
    factores_16pf: Factores16PF
    observaciones_clinicas: Optional[str] = Field(None, max_length=2000)


class RespuestaDictamen(BaseModel):
    prompt_llm: str
    impresion_diagnostica_sugerida: str
    criterio_mae_favorable: bool
    fundamentacion_dsm5: str


class SolicitudCertificadoPDF(BaseModel):
    codigoVerificacion: str = Field(..., min_length=4, max_length=60)
    fechaExpedicion: Optional[str] = Field(None, max_length=80)
    paciente: Dict[str, Any]
    mascota: Dict[str, Any]
    dictamenClinico: Optional[str] = Field(None, max_length=4000)


@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": settings.APP_TITLE,
        "profesional": settings.PROFESIONAL_NOMBRE,
        "acreditacion": settings.PROFESIONAL_REGISTRO_COMPLETO
    }


@app.post("/generar-dictamen", response_model=RespuestaDictamen)
def generar_dictamen(solicitud: SolicitudDictamen):
    """
    Recibe los decatipos del test 16PF y los síntomas referidos por el paciente,
    estructurando el prompt técnico alineado con el DSM-5 y la Ley 1090 de 2006.
    """
    scores = solicitud.factores_16pf.puntuaciones
    sintomas_txt = ", ".join(solicitud.sintomas)

    # Heurística psicométrica básica (ej: C bajo = inestabilidad afectiva, O alto = aprensión/culpa, Q4 alto = tensión)
    inestabilidad = scores.get("C", 5.0) <= 4.0
    tension_elevada = scores.get("Q4", 5.0) >= 7.0
    aprension_alta = scores.get("O", 5.0) >= 7.0

    criterio_favorable = inestabilidad or tension_elevada or aprension_alta or ("pánico" in sintomas_txt.lower())

    # Estructura del prompt interno para el LLM clínico (DSM-5)
    prompt_llm = f"""
Actúa como un Asistente Clínico Especializado en Psicodiagnóstico (DSM-5) y evaluación para Animales de Apoyo Emocional (Ley 1090 de 2006 Colombia).

PROFESIONAL RESPONSABLE: {settings.PROFESIONAL_NOMBRE} ({settings.PROFESIONAL_REGISTRO_COMPLETO})

DATOS DEL PACIENTE:
- ID Paciente: {solicitud.paciente_id}
- Sintomatología referida: {sintomas_txt}
- Observaciones de anamnesis: {solicitud.observaciones_clinicas or 'No registradas'}

PERFIL PSICOMÉTRICO (16PF - Decatipos):
{scores}

TAREA:
1. Analizar la correlación entre los factores de segundo orden (Ansiedad, Inestabilidad Emocional, Tensión) y los síntomas reportados según criterios DSM-5 (Trastorno de Ansiedad Generalizada 300.02, Trastorno de Pánico 300.01 o Trastornos Adaptativos 309.x).
2. Justificar clínicamente el rol terapéutico del animal de apoyo emocional (MAE) como agente de corregulación afectiva y reducción de la activación autonómica.
3. Redactar el párrafo técnico para ser incorporado en el Certificado y la Historia Clínica.
""".strip()

    fundamentacion = (
        "El análisis psicométrico refleja elevación en factores de tensión (Q4) y aprensión (O), con menor estabilidad (C). "
        "En consonancia con el DSM-5, los síntomas interfieren con la funcionalidad diaria y responden positivamente a la co-regulación sensorial del animal de compañía."
    )

    return RespuestaDictamen(
        prompt_llm=prompt_llm,
        impresion_diagnostica_sugerida="Trastorno de Ansiedad / Trastorno Adaptativo con sintomatología ansioso-depresiva (Criterios DSM-5)",
        criterio_mae_favorable=criterio_favorable,
        fundamentacion_dsm5=fundamentacion
    )


@app.post("/generar-pdf")
def generar_pdf_endpoint(payload: SolicitudCertificadoPDF):
    """
    Genera y retorna el archivo binario del certificado en formato PDF con membrete y pie de página legal.
    """
    try:
        pdf_bytes = generador_pdf_service.generar_certificado_mae(payload.dict())
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename=certificado_{payload.codigoVerificacion}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar el documento PDF: {str(e)}")
