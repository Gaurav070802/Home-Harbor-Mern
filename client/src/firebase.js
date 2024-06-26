// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "home-harbor-mern.firebaseapp.com",
  projectId: "home-harbor-mern",
  storageBucket: "home-harbor-mern.appspot.com",
  messagingSenderId: "667339213627",
  appId: "1:667339213627:web:5e62650c7718de385ec51e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);