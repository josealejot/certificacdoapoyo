import os
from fpdf import FPDF
from datetime import datetime
from typing import Dict, Any, Optional
from app.core.config import settings


_REEMPLAZOS_LATIN1 = {
    "\u2013": "-", "\u2014": "-", "\u2018": "'", "\u2019": "'",
    "\u201c": '"', "\u201d": '"', "\u2026": "...", "\u2022": "-", "\u00a0": " ",
}


def _limpiar_latin1(texto: str) -> str:
    """La fuente Helvetica del PDF solo admite Latin-1: normaliza los caracteres que la IA suele emitir."""
    for origen, destino in _REEMPLAZOS_LATIN1.items():
        texto = texto.replace(origen, destino)
    return texto.encode("latin-1", "replace").decode("latin-1")


class CertificadoPDF(FPDF):
    """
    Extensión de FPDF con membrete y pie de página institucional/profesional
    conforme a los requerimientos de la Ley 1090 de 2006 de Colombia.
    """
    def __init__(self, codigo_verificacion: str = "MAE-VALID-TEST"):
        super().__init__(orientation="P", unit="mm", format="Letter")
        self.codigo_verificacion = codigo_verificacion
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        # Membrete Profesional Superior
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(24, 43, 73)  # Azul clínico institucional
        self.cell(0, 7, settings.PROFESIONAL_NOMBRE.upper(), ln=True, align="C")

        self.set_font("Helvetica", "B", 10)
        self.set_text_color(70, 80, 95)
        self.cell(0, 5, settings.PROFESIONAL_TITULO, ln=True, align="C")

        self.set_font("Helvetica", "", 9)
        self.set_text_color(100, 110, 120)
        self.cell(0, 5, settings.PROFESIONAL_REGISTRO_COMPLETO, ln=True, align="C")

        # Línea divisoria decorativa
        self.set_draw_color(41, 128, 185)
        self.set_line_width(0.6)
        self.line(15, 30, 200, 30)
        self.ln(10)

    def footer(self):
        # Pie de página institucional y legal
        self.set_y(-25)
        self.set_draw_color(200, 205, 215)
        self.set_line_width(0.3)
        self.line(15, self.get_y(), 200, self.get_y())
        self.ln(3)

        self.set_font("Helvetica", "I", 7.5)
        self.set_text_color(110, 115, 125)
        legal_text = (
            "Documento emitido en conformidad con la Ley 1090 de 2006 (Código Deontológico del Psicólogo en Colombia) "
            "y la Resolución 1995 de 1999. Válido ante aerolíneas, conjuntos residenciales y entidades públicas."
        )
        self.multi_cell(0, 3.5, legal_text, align="C")

        self.set_font("Helvetica", "", 8)
        self.cell(0, 5, f"Código de Verificación Único: {self.codigo_verificacion} | Pág. {self.page_no()}/{{nb}}", align="C")


class GeneradorPDF:
    """
    Servicio de generación de Certificados y Dictámenes de Apoyo Emocional (MAE).
    """

    def generar_certificado_mae(self, datos: Dict[str, Any]) -> bytes:
        """
        Genera el PDF binario con la estructura clínica oficial:
        - Datos del paciente y mascota
        - Fundamentación diagnóstica (DSM-5) y evaluación psicométrica
        - Dictamen de prescripción de Mascota de Apoyo Emocional
        - Firma digital y credenciales profesionales
        """
        codigo = datos.get("codigoVerificacion") or "MAE-2026-DEFAULT"
        pdf = CertificadoPDF(codigo_verificacion=codigo)
        pdf.alias_nb_pages()
        pdf.add_page()

        # Título del Certificado
        pdf.set_font("Helvetica", "B", 13)
        pdf.set_text_color(24, 43, 73)
        pdf.cell(0, 8, "CERTIFICADO CLÍNICO DE MASCOTA DE APOYO EMOCIONAL (MAE)", ln=True, align="C")
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(100, 100, 100)
        fecha_str = datos.get("fechaExpedicion") or datetime.now().strftime("%d de %B de %Y")
        pdf.cell(0, 5, f"Expedido en Colombia a: {fecha_str}", ln=True, align="C")
        pdf.ln(5)

        # Introducción legal
        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_text_color(30, 30, 30)
        cuerpo_intro = (
            f"El suscrito psicólogo, {settings.PROFESIONAL_NOMBRE}, identificado con {settings.PROFESIONAL_REGISTRO_COMPLETO}, "
            f"en ejercicio legal de la profesión y dando estricto cumplimiento al Código Deontológico y Bioético de la Psicología "
            f"(Ley 1090 de 2006):"
        )
        pdf.multi_cell(0, 5, cuerpo_intro)
        pdf.ln(3)

        pdf.set_font("Helvetica", "B", 10.5)
        pdf.cell(0, 6, "CERTIFICA QUE:", ln=True, align="L")
        pdf.ln(1)

        # Datos del Paciente
        paciente = datos.get("paciente") or {}
        nombre_paciente = f"{paciente.get('nombres', '')} {paciente.get('apellidos', '')}".strip() or "PACIENTE REGISTRADO"
        doc_tipo = paciente.get("tipoDocumento", "C.C.")
        doc_num = paciente.get("numeroDocumento", "N/A")

        pdf.set_font("Helvetica", "", 9.5)
        texto_paciente = (
            f"El(la) señor(a) {nombre_paciente}, identificado(a) con documento {doc_tipo} No. {doc_num}, "
            f"ha sido valorado(a) clínicamente mediante anamnesis psicológica, examen mental y aplicación de instrumentos "
            f"psicométricos estandarizados (Cuestionario Factorial de Personalidad 16PF)."
        )
        pdf.multi_cell(0, 5, texto_paciente)
        pdf.ln(3)

        # Fundamentación Clínica & Diagnóstica
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(24, 43, 73)
        pdf.cell(0, 6, "IMPRESIÓN CLÍNICA Y CRITERIO TERAPÉUTICO (DSM-5):", ln=True, align="L")
        pdf.set_text_color(30, 30, 30)
        pdf.set_font("Helvetica", "", 9.5)

        dictamen_clinico = datos.get("dictamenClinico") or (
            "La evaluación evidencia sintomatología relacionada con desregulación afectiva y niveles elevados de tensión/ansiedad, "
            "cumpliendo criterios de soporte según el DSM-5. El vínculo afectivo con su ejemplar canino/felino actúa como facilitador "
            "de contención emocional, disminuyendo la sobrecarga fisiológica y facilitando la autorregulación."
        )
        pdf.multi_cell(0, 5, _limpiar_latin1(dictamen_clinico))
        pdf.ln(3)

        # Datos del Ejemplar de Apoyo Emocional
        mascota = datos.get("mascota", {})
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(24, 43, 73)
        pdf.cell(0, 6, "DATOS DE LA MASCOTA DE SOPORTE:", ln=True, align="L")
        pdf.set_text_color(30, 30, 30)
        pdf.set_font("Helvetica", "", 9.5)

        datos_mascota_texto = (
            f"- Nombre del ejemplar: {mascota.get('nombre', 'N/A')}\n"
            f"- Especie: {mascota.get('especie', 'Canina/Felina')} | Raza: {mascota.get('raza', 'Mestizo')}\n"
            f"- Microchip / Identificacion: {mascota.get('microchip', 'En registro')}"
        )
        pdf.multi_cell(0, 5, datos_mascota_texto)
        pdf.ln(3)

        # Prescripción y Recomendación Final
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(24, 43, 73)
        pdf.cell(0, 6, "RECOMENDACIÓN Y CONCEPTO FINAL:", ln=True, align="L")
        pdf.set_text_color(30, 30, 30)
        pdf.set_font("Helvetica", "", 9.5)

        prescripcion = (
            "Por lo anterior, se PRESCRÍBE Y CERTIFICA la presencia permanente del ejemplar como Mascota de Apoyo Emocional "
            "(MAE), como parte indispensable de su plan de estabilización psicológica. Se sugiere a las autoridades de transporte "
            "aéreo/terrestre y administraciones residenciales permitir su libre acompañamiento junto al paciente."
        )
        pdf.multi_cell(0, 5, prescripcion)
        pdf.ln(8)

        # Bloque de Firma Profesional
        pdf.ln(3)

        # Localizar e insertar la firma caligráfica profesional
        assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
        firma_path = os.path.join(assets_dir, "firma_profesional.png")

        if os.path.exists(firma_path):
            ancho_firma = 65
            alto_firma = ancho_firma * (330 / 1024)  # Proporción exacta original ~20.9mm
            x_firma = (pdf.w - ancho_firma) / 2
            y_base = pdf.get_y()
            pdf.image(firma_path, x=x_firma, y=y_base, w=ancho_firma)

            # Posicionar la línea sutil de firma
            pdf.set_y(y_base + alto_firma + 1)
            pdf.set_draw_color(70, 80, 95)
            pdf.set_line_width(0.35)
            pdf.line(55, pdf.get_y(), pdf.w - 55, pdf.get_y())
            pdf.ln(3)
        else:
            pdf.set_font("Helvetica", "B", 9.5)
            pdf.cell(0, 5, "__________________________________________________", ln=True, align="C")

        pdf.set_font("Helvetica", "B", 9.5)
        pdf.set_text_color(24, 43, 73)
        pdf.cell(0, 5, settings.PROFESIONAL_NOMBRE, ln=True, align="C")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(70, 80, 95)
        pdf.cell(0, 4, settings.PROFESIONAL_TITULO, ln=True, align="C")
        pdf.cell(0, 4, settings.PROFESIONAL_REGISTRO_COMPLETO, ln=True, align="C")

        return bytes(pdf.output())
