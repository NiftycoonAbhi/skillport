// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDMUbEXksYj93SCe5gjQN2biI1R5Vn5Hc4",
  authDomain: "skillport-2d059.firebaseapp.com",
  projectId: "skillport-2d059",
  storageBucket: "skillport-2d059.appspot.com",
  messagingSenderId: "270045853774",
  appId: "1:270045853774:web:9990e417012978190dab1f",
  measurementId: "G-8Z3DRGNNNW"
};

const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
