import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcsupbQB5vNlZGfTFXUxq5q7SKBry5ntM",
  authDomain: "omniflow-8933a.firebaseapp.com",
  projectId: "omniflow-8933a",
  storageBucket: "omniflow-8933a.firebasestorage.app",
  messagingSenderId: "250987767866",
  appId: "1:250987767866:web:a746b33b2eea130a772d03",
  measurementId: "G-04S0V5GJ4N"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence to local (survives page refresh)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.log("Persistence error:", error);
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
