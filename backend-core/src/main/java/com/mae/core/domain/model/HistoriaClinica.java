package com.mae.core.domain.model;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Entidad de Dominio: HistoriaClinica
 * 
 * Cumple con el marco de la Ley 1090 de 2006 (Código Deontológico del Psicólogo en Colombia)
 * y la Resolución 1995 de 1999 (Custodia y diligenciamiento de Historias Clínicas).
 * 
 * Modela el registro inmutable de la valoración psicológica, anamnesis,
 * examen mental y el criterio clínico para animales de apoyo emocional (MAE).
 */
public class HistoriaClinica {

    private final String id;
    private final String pacienteId;
    private final Instant fechaApertura;
    private final String motivoConsulta;
    private final Antecedentes antecedentes;
    private final ExamenMental examenMental;
    private final List<String> impresionDiagnosticaDSM5;
    private final CriterioApoyoEmocional criterioApoyoEmocional;
    private final ProfesionalTratante profesionalTratante;
    private EstadoHistoria estado;
    private Instant fechaCierre;

    public enum EstadoHistoria {
        BORRADOR,
        FIRMADA,
        ARCHIVADA
    }

    public HistoriaClinica(
            String id,
            String pacienteId,
            Instant fechaApertura,
            String motivoConsulta,
            Antecedentes antecedentes,
            ExamenMental examenMental,
            List<String> impresionDiagnosticaDSM5,
            CriterioApoyoEmocional criterioApoyoEmocional,
            ProfesionalTratante profesionalTratante,
            EstadoHistoria estado
    ) {
        this.id = Objects.requireNonNull(id, "El ID de la historia clínica no puede ser nulo");
        this.pacienteId = Objects.requireNonNull(pacienteId, "El ID del paciente es obligatorio");
        this.fechaApertura = (fechaApertura != null) ? fechaApertura : Instant.now();
        this.motivoConsulta = Objects.requireNonNull(motivoConsulta, "El motivo de consulta es obligatorio por ley");
        this.antecedentes = antecedentes != null ? antecedentes : new Antecedentes("", "", "", "");
        this.examenMental = Objects.requireNonNull(examenMental, "El examen mental es obligatorio en la valoración psicológica");
        this.impresionDiagnosticaDSM5 = impresionDiagnosticaDSM5 != null ? List.copyOf(impresionDiagnosticaDSM5) : Collections.emptyList();
        this.criterioApoyoEmocional = Objects.requireNonNull(criterioApoyoEmocional, "Debe registrarse el criterio sobre Mascota de Apoyo Emocional");
        this.profesionalTratante = (profesionalTratante != null) ? profesionalTratante : ProfesionalTratante.porDefecto();
        this.estado = estado != null ? estado : EstadoHistoria.BORRADOR;
    }

    /**
     * Regla de Negocio: Una vez firmada, la historia clínica adquiere carácter de documento legal inalterable.
     */
    public void firmar(String firmaDigitalHash) {
        if (this.estado == EstadoHistoria.FIRMADA) {
            throw new IllegalStateException("La historia clínica ya se encuentra firmada y cerrada.");
        }
        if (this.impresionDiagnosticaDSM5.isEmpty()) {
            throw new IllegalStateException("No se puede firmar una historia clínica sin impresión diagnóstica (DSM-5 / CIE).");
        }
        this.estado = EstadoHistoria.FIRMADA;
        this.fechaCierre = Instant.now();
    }

    public boolean esAptaParaCertificadoMAE() {
        return this.estado == EstadoHistoria.FIRMADA &&
               this.criterioApoyoEmocional != null &&
               this.criterioApoyoEmocional.isAmeritaMAE();
    }

    // Getters
    public String getId() { return id; }
    public String getPacienteId() { return pacienteId; }
    public Instant getFechaApertura() { return fechaApertura; }
    public String getMotivoConsulta() { return motivoConsulta; }
    public Antecedentes getAntecedentes() { return antecedentes; }
    public ExamenMental getExamenMental() { return examenMental; }
    public List<String> getImpresionDiagnosticaDSM5() { return impresionDiagnosticaDSM5; }
    public CriterioApoyoEmocional getCriterioApoyoEmocional() { return criterioApoyoEmocional; }
    public ProfesionalTratante getProfesionalTratante() { return profesionalTratante; }
    public EstadoHistoria getEstado() { return estado; }
    public Instant getFechaCierre() { return fechaCierre; }

    // Value Objects Internos
    public record Antecedentes(
            String personales,
            String familiares,
            String psiquiatricos,
            String farmacologicos
    ) {}

    public record ExamenMental(
            String porteActitud,
            String orientacionConciencia,
            String afectoEmocion,
            String pensamientoJuicio
    ) {}

    public record CriterioApoyoEmocional(
            boolean ameritaMAE,
            String justificacionTerapeutica,
            String evaluacionVinculoAnimal,
            String idMascotaRegistrada
    ) {
        public boolean isAmeritaMAE() {
            return ameritaMAE;
        }
    }

    public record ProfesionalTratante(
            String nombre,
            String titulo,
            String tarjetaProfesionalColpsic,
            String resolucionRethus
    ) {
        public static ProfesionalTratante porDefecto() {
            return new ProfesionalTratante(
                    "José Alejandro Tangarife David",
                    "Psicólogo Clínico y Social",
                    "184919",
                    "Res. 5413719"
            );
        }
    }
}
