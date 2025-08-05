import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5-5_d55vMawCpwguy9JmS_g52XSwfl2o",
  authDomain: "ro-js-b6d9b.firebaseapp.com",
  projectId: "ro-js-b6d9b",
  storageBucket: "ro-js-b6d9b.firebasestorage.app",
  messagingSenderId: "913958669543",
  appId: "1:913958669543:web:b9f8ca4106a7736f7ae642",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
