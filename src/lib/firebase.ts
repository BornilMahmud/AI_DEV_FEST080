import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

// Official Firebase configuration provided for upay Sentinel
const firebaseConfig = {
  apiKey: "AIzaSyAVwEtoWKdp9NarJYPbtnK84FLCdJRDAwU",
  authDomain: "phase-2-6def1.firebaseapp.com",
  projectId: "phase-2-6def1",
  storageBucket: "phase-2-6def1.firebasestorage.app",
  messagingSenderId: "10025565327",
  appId: "1:10025565327:web:527350a203c208fbae44fa",
  measurementId: "G-RHKQSGN8LD",
};

// Initialize or reuse Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
export const githubProvider = new GithubAuthProvider();

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  firebaseSignOut,
  onAuthStateChanged,
};

export type { FirebaseUser };
