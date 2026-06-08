import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "mock-key",
  authDomain: "mock-domain",
  projectId: "mock-project",
  storageBucket: "mock-bucket",
  messagingSenderId: "mock-sender",
  appId: "mock-app"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
