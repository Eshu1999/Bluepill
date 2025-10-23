
// src/lib/firebase-admin-init.ts
import * as admin from 'firebase-admin';
import { credential } from 'firebase-admin';

let adminInitializationPromise: Promise<void> | null = null;

function initializeAdminSDK() {
  if (admin.apps.length > 0) {
    // If it's already initialized, return a resolved promise.
    return Promise.resolve();
  }

  // If initialization is already in progress, return the existing promise.
  if (adminInitializationPromise) {
    return adminInitializationPromise;
  }

  // Start the initialization and store the promise.
  adminInitializationPromise = new Promise((resolve, reject) => {
    try {
      console.log('Initializing Firebase Admin SDK...');
      // When deployed, Google Cloud automatically provides credentials.
      // Locally, we need to explicitly use application default credentials.
      admin.initializeApp({
        credential: credential.applicationDefault(),
      });
      console.log('Firebase Admin SDK initialized successfully.');
      resolve();
    } catch (error: any) {
      console.error('CRITICAL: Firebase Admin SDK initialization failed', error);
      reject(new Error(`Firebase Admin SDK initialization failed: ${error.message}`));
    }
  });

  return adminInitializationPromise;
}

// Initialize and export the promise.
const promise = initializeAdminSDK();
export { promise as adminInitializationPromise };


// Export the initialized admin object for convenience, but usage should be guarded.
export { admin };
