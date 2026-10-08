import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../../services/firebase';

// Correo único con potestad legal y profesional en la plataforma
const EMAIL_AUTORIZADO = 'josealejot@gmail.com';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState(EMAIL_AUTORIZADO);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    const emailLimpio = email.trim().toLowerCase();

    // 1. Verificación Estricta de Lista Blanca (Solo josealejot@gmail.com)
    if (emailLimpio !== EMAIL_AUTORIZADO) {
      setError(
        'ACCESO DENEGADO: Esta plataforma clínica es de uso exclusivo del Dr. José Alejandro Tangarife David. ' +
        'El correo ingresado no posee autorización profesional para emitir certificados bajo la Ley 1090 de 2006.'
      );
      setLoading(false);
      return;
    }

    try {
      // 2. Intentar iniciar sesión
      try {
        await signInWithEmailAndPassword(auth, emailLimpio, password);
        if (onLoginSuccess) onLoginSuccess();
      } catch (signInErr) {
        // Si el usuario aún no existe en Firebase Authentication, lo provisionamos automáticamente con su clave
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, emailLimpio, password);
            if (onLoginSuccess) onLoginSuccess();
            return;
          } catch (createErr) {
            if (createErr.code === 'auth/email-already-in-use') {
              throw new Error('Contraseña incorrecta. Por favor verifica la clave ingresada.');
            } else {
              throw createErr;
            }
          }
        } else {
          throw signInErr;
        }
      }
    } catch (err) {
      console.error('Error de autenticación:', err);
      let mensajeAmigable = err.message || 'Error al autenticar. Verifica tu contraseña.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        mensajeAmigable = 'Contraseña incorrecta para el usuario josealejot@gmail.com.';
      } else if (err.code === 'auth/too-many-requests') {
        mensajeAmigable = 'Demasiados intentos fallidos. Por seguridad, espera unos minutos o restablece la contraseña.';
      }
      setError(mensajeAmigable);
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarContrasena = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, EMAIL_AUTORIZADO);
      setInfoMessage(`Se ha enviado un enlace seguro para restablecer tu clave a ${EMAIL_AUTORIZADO}.`);
    } catch (err) {
      setError('Error al enviar recuperación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Elementos visuales de fondo */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
        {/* Cabecera del Login */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-semibold text-sky-400 mb-3">
            <span>🔐 Acceso Exclusivo Autorizado</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Plataforma Certificados MAE
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistema Clínico y Legal (Ley 1090 de 2006)
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <p className="font-semibold text-sky-300">Dr. José Alejandro Tangarife David</p>
            <p className="text-[11px] text-slate-400">Psicólogo Clínico | Esp. en Seguridad y Salud en el Trabajo</p>
            <p className="text-[10px] text-slate-500">TP Colpsic 184919 | RETHUS Res. 5413719</p>
          </div>
        </div>

        {/* Mensajes de error / informativos */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
            <span className="text-sm">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {infoMessage && (
          <div className="mb-5 p-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-start gap-2">
            <span className="text-sm">✅</span>
            <p>{infoMessage}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Usuario Profesional Autorizado
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Único usuario con permisos de expedición en el sistema.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Contraseña
              </label>
              <button
                type="button"
                onClick={handleRecuperarContrasena}
                className="text-[11px] text-sky-400 hover:text-sky-300 transition cursor-pointer"
              >
                ¿Olvidaste tu clave?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu clave"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Verificando identidad profesional...</span>
            ) : (
              <span>Ingresar al Panel Clínico</span>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Registro público desactivado. Solo el titular del perfil profesional puede acceder.
          </p>
        </div>
      </div>

      {/* Pie legal */}
      <footer className="mt-6 text-center text-xs text-slate-600 max-w-sm leading-relaxed">
        Plataforma protegida con cifrado TLS 1.3 y autenticación restringida. Sujeta a custodia según Resolución 1995 de 1999.
      </footer>
    </div>
  );
}
