
import { Auth } from 'firebase-admin/auth';
import { Firestore } from 'firebase-admin/firestore';
import { admin, adminInitializationPromise as initPromise } from './firebase-admin-init'; // Import the initialized admin instance and promise.

// We export getters that return the services from the initialized admin object.
// These are safe to use as long as the initialization promise has been awaited somewhere upstream.
export const getAdminAuth = (): Auth => {
  if (!admin.apps.length) {
    throw new Error('Admin SDK not initialized yet. You must await adminInitializationPromise before using getAdminAuth.');
  }
  return admin.auth();
};

export const getAdminDb = (): Firestore => {
  if (!admin.apps.length) {
    throw new Error('Admin SDK not initialized yet. You must await adminInitializationPromise before using getAdminDb.');
  }
  return admin.firestore();
};

// We also export the initialization promise for any parts of the app
// that might need to explicitly wait. This is the key export.
export const adminInitializationPromise = initPromise;
