import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyD4CJkYzwel_nrJikdYTfFV8VmjKpflRdo",
  authDomain: "mobile-app-1a08b.firebaseapp.com",
  projectId: "mobile-app-1a08b",
  storageBucket: "mobile-app-1a08b.firebasestorage.app",
  messagingSenderId: "579618093043",
  appId: "1:579618093043:web:33ae0a0955e37f9e16c486",
  measurementId: "G-9N3L3L9H5K"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
