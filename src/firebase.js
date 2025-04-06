// filepath: c:\UrpExam\Front\src\firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgu1YxXnilh3T-d8FC4LNsZUjaJh2x3HE",
  authDomain: "react-sieii-firebase.firebaseapp.com",
  projectId: "react-sieii-firebase",
  storageBucket: "react-sieii-firebase.firebasestorage.app",
  messagingSenderId: "671599667116",
  appId: "1:671599667116:web:713dceec89ab822f3d3c09"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);