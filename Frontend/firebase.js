// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-e2f83.firebaseapp.com",
  projectId: "vingo-food-e2f83",
  storageBucket: "vingo-food-e2f83.firebasestorage.app",
  messagingSenderId: "248193878447",
  appId: "1:248193878447:web:1ec8a3db3e95e6ad0f875a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
