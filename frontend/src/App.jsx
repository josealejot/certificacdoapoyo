import React, { useState } from 'react';
import axios from 'axios';

const FASTAPI_URL = 'http://localhost:8000';

export default function App() {
  const [paciente, setPaciente] = useState({
    nombres: 'María Camila',
    apellidos: 'Restrepo Gómez',
    tipoDocumento: 'C.C.',
    numeroDocumento: '1020456789',
  });

  const [mascota, setMascota] = useState({
    nombre: 'Milo',
    especie: 'Canino',
    raza: 'Golden Retriever',
    microchip: '981098123456789',
  });

  const [sintomas, setSintomas] = useState('Ansiedad generalizada, episodios de desregulación emocional en transporte público, insomnio de conciliación.');

  const [scores16PF, setScores16PF] = useState({
    C: 3.5, // Estabilidad emocional baja
    O: 8.0, // Aprensión / culpa alta
    Q4: 8.5, // Tensión energética alta
    L: 6.0,
    Q3: 4.0,
  });

  const [dictamenIA, setDictamenIA] = useState(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleAnalizarIA = async () => {
    setLoadingIA(true);
    setErrorMsg(null);
    try {
      const res = await axios.post(`${FASTAPI_URL}/generar-dictamen`, {
        paciente_id: paciente.numeroDocumento,
        sintomas: sintomas.split(',').map((s) => s.trim()),
        factores_16pf: {
          puntuaciones: scores16PF,
          ansiedad_global: 8.2,
        },
      });
      setDictamenIA(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo conectar con el microservicio de IA (puerto 8000). Asegúrate de iniciar FastAPI con uvicorn.');
    } finally {
      setLoadingIA(false);
    }
  };

  const handleDescargarPDF = async () => {
    setLoadingPDF(true);
    setErrorMsg(null);
    try {
      const res = await axios.post(
        `${FASTAPI_URL}/generar-pdf`,
        {
          codigoVerificacion: `MAE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          fechaExpedicion: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
          paciente: paciente,
          mascota: mascota,
          dictamenClinico: dictamenIA ? dictamenIA.fundamentacion_dsm5 : undefined,
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificado_MAE_${paciente.nombres}_${paciente.apellidos}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al descargar el PDF. Verifica que el servidor FastAPI esté corriendo.');
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Encabezado Institucional y Profesional */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-sky-500 text-white font-bold text-xs uppercase px-2 py-0.5 rounded tracking-wide">
                Ley 1090 de 2006
              </span>
              <span className="text-slate-400 text-xs">Colombia</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Plataforma Clínica de Certificados MAE
            </h1>
            <p className="text-sm text-slate-300">
              Evaluación Psicológica, Diagnóstico DSM-5 y Expedición Oficial de Apoyo Emocional
            </p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-right">
            <p className="text-xs text-sky-400 font-semibold uppercase">Profesional Responsable</p>
            <p className="text-sm font-bold text-slate-100">José Alejandro Tangarife David</p>
            <p className="text-xs text-slate-300">Psicólogo Clínico y Social</p>
            <p className="text-[11px] text-slate-400">TP Colpsic 184919 | RETHUS Res. 5413719</p>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Formulario Clínico */}
        <div className="lg:col-span-2 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded text-sm">
              <p className="font-semibold">Aviso de Conexión:</p>
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Card Paciente */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-center justify-between">
              <span>1. Identificación del Paciente</span>
              <span className="text-xs font-normal text-slate-500">Historia Clínica Activa</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombres</label>
                <input
                  type="text"
                  value={paciente.nombres}
                  onChange={(e) => setPaciente({ ...paciente, nombres: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Apellidos</label>
                <input
                  type="text"
                  value={paciente.apellidos}
                  onChange={(e) => setPaciente({ ...paciente, apellidos: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Documento</label>
                <select
                  value={paciente.tipoDocumento}
                  onChange={(e) => setPaciente({ ...paciente, tipoDocumento: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                  <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                  <option value="PAS">Pasaporte (PAS)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Número de Documento</label>
                <input
                  type="text"
                  value={paciente.numeroDocumento}
                  onChange={(e) => setPaciente({ ...paciente, numeroDocumento: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card Mascota */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">
              2. Datos del Ejemplar de Apoyo Emocional (MAE)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de la Mascota</label>
                <input
                  type="text"
                  value={mascota.nombre}
                  onChange={(e) => setMascota({ ...mascota, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Especie</label>
                <input
                  type="text"
                  value={mascota.especie}
                  onChange={(e) => setMascota({ ...mascota, especie: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Raza</label>
                <input
                  type="text"
                  value={mascota.raza}
                  onChange={(e) => setMascota({ ...mascota, raza: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Microchip / Identificación</label>
                <input
                  type="text"
                  value={mascota.microchip}
                  onChange={(e) => setMascota({ ...mascota, microchip: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card Psicométrica 16PF y Sintomatología */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">
              3. Evaluación Psicométrica (16PF) y Criterios DSM-5
            </h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sintomatología Clínica Reportada</label>
              <textarea
                rows="2"
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Factor C (Estabilidad)</label>
                <p className="text-[11px] text-slate-400">Decatipo (1-10)</p>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={scores16PF.C}
                  onChange={(e) => setScores16PF({ ...scores16PF, C: parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Factor O (Aprensión)</label>
                <p className="text-[11px] text-slate-400">Decatipo (1-10)</p>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={scores16PF.O}
                  onChange={(e) => setScores16PF({ ...scores16PF, O: parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Factor Q4 (Tensión)</label>
                <p className="text-[11px] text-slate-400">Decatipo (1-10)</p>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={scores16PF.Q4}
                  onChange={(e) => setScores16PF({ ...scores16PF, Q4: parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Acciones y Dictamen */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Acciones del Ecosistema</h3>

            <button
              onClick={handleAnalizarIA}
              disabled={loadingIA}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingIA ? 'Analizando con DSM-5...' : '🧠 Analizar Dictamen Clínico (IA)'}
            </button>

            <button
              onClick={handleDescargarPDF}
              disabled={loadingPDF}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingPDF ? 'Generando Documento...' : '📄 Descargar Certificado Oficial (PDF)'}
            </button>

            <div className="text-[11px] text-slate-500 pt-2 border-t space-y-1">
              <p>✔ Membrete y pie de página con datos oficiales del profesional.</p>
              <p>✔ Validez legal ante aerolíneas y copropiedades.</p>
            </div>
          </div>

          {dictamenIA && (
            <div className="bg-sky-50 border border-sky-200 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wide">Dictamen Sugerido</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  {dictamenIA.criterio_mae_favorable ? 'Criterio Favorable' : 'En Revisión'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800">{dictamenIA.impresion_diagnostica_sugerida}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{dictamenIA.fundamentacion_dsm5}</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Plataforma Certificados MAE Colombia • Sujeta a la Ley 1090 de 2006 y Resolución 1995 de 1999 • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
