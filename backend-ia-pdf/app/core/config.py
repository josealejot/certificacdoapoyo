from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Datos Globales del Profesional (Constantes del Sistema)
    PROFESIONAL_NOMBRE: str = "José Alejandro Tangarife David"
    PROFESIONAL_TITULO: str = "Psicólogo Clínico y Social"
    PROFESIONAL_COLPSIC: str = "Tarjeta Profesional Colpsic 184919"
    PROFESIONAL_RETHUS: str = "RETHUS Res. 5413719"
    PROFESIONAL_REGISTRO_COMPLETO: str = (
        "Tarjeta Profesional Colpsic 184919 | RETHUS Res. 5413719"
    )
    
    # Configuración de Servidor
    APP_TITLE: str = "MAE Colombia - Servicio IA & Generador PDF Clínico"
    APP_VERSION: str = "1.0.0"
    PORT: int = 8000
    
    class Config:
        env_file = ".env"

settings = Settings()
