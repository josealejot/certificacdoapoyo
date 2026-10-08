import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Configuración de Firebase para el Frontend.
 * Las claves se cargan de forma segura desde las variables de entorno (.env).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCnWKOtc5CByR55-ODq_YSyyuBZBhyK0Bo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "certificados-apoyo-emocional.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "certificados-apoyo-emocional",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "certificados-apoyo-emocional.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "43186318406",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:43186318406:web:2b7cb2ef129a137cc3ee47",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
