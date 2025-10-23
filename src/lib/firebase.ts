
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, sendEmailVerification, signInWithPopup, getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "medisure-i42u7",
  "appId": "1:127262973265:web:385317266925e457a88770",
  "apiKey": "AIzaSyAusLnhkOqLsTmG9q-wgE63z7_86lGl8v0",
  "authDomain": "medisure-i42u7.firebaseapp.com",
  "measurementId": "G-HQ1Z53WKDR",
  "messagingSenderId": "127262973265",
  "storageBucket": "medisure-i42u7.appspot.com"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, sendEmailVerification, signInWithPopup, getRedirectResult, signInWithRedirect };
