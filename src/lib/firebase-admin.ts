import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

if (!getApps().length) {
  // Utilise GOOGLE_APPLICATION_CREDENTIALS si défini, sinon ADC / métadonnées Cloud.
  const hasCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  initializeApp({
    projectId: firebaseConfig.projectId,
    ...(hasCredentials ? { credential: applicationDefault() } : {}),
  });
}

export const adminAuth = getAuth();
