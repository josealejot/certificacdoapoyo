import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      if (isRegistering) {
        // Registro del profesional
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Inicio de sesión
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      console.error('Error de autenticación:', err);
      let mensajeAmigable = 'Error al autenticar. Verifica tus credenciales.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        mensajeAmigable = 'Correo electrónico o contraseña incorrectos.';
      } else if (err.code === 'auth/user-not-found') {
        mensajeAmigable = 'No se encontró una cuenta con este correo. ¿Deseas registrarte?';
      } else if (err.code === 'auth/weak-password') {
        mensajeAmigable = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/email-already-in-use') {
        mensajeAmigable = 'Este correo ya tiene una cuenta registrada. Inicia sesión.';
      } else if (err.code === 'auth/operation-not-allowed') {
        mensajeAmigable = 'El método de autenticación por correo no está activado en tu consola de Firebase. Debes activarlo en Authentication > Sign-in method.';
      }
      setError(mensajeAmigable);
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarContrasena = async () => {
    if (!email) {
      setError('Escribe tu correo electrónico para enviarte el enlace de recuperación.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setInfoMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } catch (err) {
      setError('Error al solicitar recuperación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Elementos visuales de fondo */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-2xl relative z-10">
        {/* Cabecera del Login */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-semibold text-sky-400 mb-3">
            <span>🔒 Acceso Clínico Restringido</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Plataforma Certificados MAE
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistema bajo Ley 1090 de 2006 (Colombia)
          </p>
          <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-300">
            <p className="font-semibold text-sky-300">Dr. José Alejandro Tangarife David</p>
            <p className="text-[11px] text-slate-400">Psicólogo Clínico | Esp. en Seguridad y Salud en el Trabajo</p>
            <p className="text-[10px] text-slate-500">TP Colpsic 184919 | RETHUS Res. 5413719</p>
          </div>
        </div>

        {/* Mensajes de error / informativos */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {infoMessage && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-start gap-2">
            <span>✅</span>
            <p>{infoMessage}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Correo Electrónico Profesional
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-correo@ejemplo.com"
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Contraseña
              </label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={handleRecuperarContrasena}
                  className="text-[11px] text-sky-400 hover:text-sky-300 transition"
                >
                  ¿Olvidaste tu clave?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Verificando credenciales...</span>
            ) : isRegistering ? (
              <span>Crear Cuenta Profesional</span>
            ) : (
              <span>Ingresar al Panel Seguro</span>
            )}
          </button>
        </form>

        {/* Alternar entre Login y Registro inicial */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setInfoMessage(null);
            }}
            className="text-xs text-slate-400 hover:text-sky-400 transition"
          >
            {isRegistering
              ? '¿Ya tienes tu cuenta creada? Inicia sesión aquí'
              : '¿Primera vez aquí? Registra tu cuenta profesional autorizada'}
          </button>
        </div>
      </div>

      {/* Pie legal de autenticación */}
      <footer className="mt-8 text-center text-xs text-slate-500 max-w-sm leading-relaxed">
        Acceso estrictamente reservado al profesional responsable. Toda actividad queda registrada con auditoría de seguridad criptográfica y timestamp.
      </footer>
    </div>
  );
}
