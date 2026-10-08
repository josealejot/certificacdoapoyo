import { db } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

/**
 * Guarda el registro de un certificado, paciente y mascota en Firestore
 * en cumplimiento de la estructura definida en esquema_bd.md
 */
export async function registrarCertificadoEnFirestore({ paciente, mascota, dictamenClinico, codigoVerificacion }) {
  try {
    const docRef = await addDoc(collection(db, 'certificados'), {
      codigoValidacion: codigoVerificacion,
      paciente: {
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        tipoDocumento: paciente.tipoDocumento,
        numeroDocumento: paciente.numeroDocumento,
      },
      mascota: {
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza,
        microchip: mascota.microchip,
      },
      dictamenClinico: dictamenClinico || 'Evaluación psicológica y criterio favorable para Animal de Apoyo Emocional.',
      profesional: {
        nombre: 'José Alejandro Tangarife David',
        registro: 'Tarjeta Profesional Colpsic 184919 | RETHUS Res. 5413719',
      },
      estado: 'VIGENTE',
      createdAt: serverTimestamp(),
    });

    console.log('Certificado registrado exitosamente en Firestore con ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error al registrar en Firestore:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Consulta los certificados emitidos más recientemente
 */
export async function obtenerUltimosCertificados(limite = 5) {
  try {
    const q = query(collection(db, 'certificados'), orderBy('createdAt', 'desc'), limit(limite));
    const snapshot = await getDocs(q);
    const lista = [];
    snapshot.forEach((doc) => {
      lista.push({ id: doc.id, ...doc.data() });
    });
    return lista;
  } catch (error) {
    console.error('Error al consultar Firestore:', error);
    return [];
  }
}
