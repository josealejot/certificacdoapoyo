package com.mae.core.domain.model;

import java.time.LocalDate;
import java.time.Period;
import java.util.Objects;

/**
 * Entidad de Dominio: Paciente
 * Modela al usuario titular de la evaluación psicológica y del animal de soporte.
 */
public class Paciente {

    private final String id;
    private final String nombres;
    private final String apellidos;
    private final TipoDocumento tipoDocumento;
    private final String numeroDocumento;
    private final LocalDate fechaNacimiento;
    private String telefono;
    private String email;
    private String ciudad;
    private String direccion;

    public enum TipoDocumento {
        CC,  // Cédula de Ciudadanía
        CE,  // Cédula de Extranjería
        PAS, // Pasaporte
        TI   // Tarjeta de Identidad
    }

    public Paciente(
            String id,
            String nombres,
            String apellidos,
            TipoDocumento tipoDocumento,
            String numeroDocumento,
            LocalDate fechaNacimiento,
            String telefono,
            String email,
            String ciudad,
            String direccion
    ) {
        this.id = Objects.requireNonNull(id, "El ID del paciente es obligatorio");
        this.nombres = Objects.requireNonNull(nombres, "Los nombres son obligatorios").trim();
        this.apellidos = Objects.requireNonNull(apellidos, "Los apellidos son obligatorios").trim();
        this.tipoDocumento = Objects.requireNonNull(tipoDocumento, "El tipo de documento es obligatorio");
        this.numeroDocumento = Objects.requireNonNull(numeroDocumento, "El número de documento es obligatorio").trim();
        this.fechaNacimiento = Objects.requireNonNull(fechaNacimiento, "La fecha de nacimiento es obligatoria");
        this.telefono = telefono;
        this.email = email;
        this.ciudad = ciudad;
        this.direccion = direccion;
    }

    public String getNombreCompleto() {
        return nombres + " " + apellidos;
    }

    public int getEdad() {
        return Period.between(this.fechaNacimiento, LocalDate.now()).getYears();
    }

    // Getters y Setters de actualización de contacto
    public String getId() { return id; }
    public String getNombres() { return nombres; }
    public String getApellidos() { return apellidos; }
    public TipoDocumento getTipoDocumento() { return tipoDocumento; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public String getTelefono() { return telefono; }
    public String getEmail() { return email; }
    public String getCiudad() { return ciudad; }
    public String getDireccion() { return direccion; }

    public void actualizarContacto(String telefono, String email, String ciudad, String direccion) {
        this.telefono = telefono;
        this.email = email;
        this.ciudad = ciudad;
        this.direccion = direccion;
    }
}
