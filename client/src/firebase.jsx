// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWYw8AKERPV44qqvRn0K1XBAhoAuL1e88",
  authDomain: "textile-f9781.firebaseapp.com",
  projectId: "textile-f9781",
  storageBucket: "textile-f9781.firebasestorage.app",
  messagingSenderId: "97715463778",
  appId: "1:97715463778:web:bb899f9c2201b7c45fd33b",
  measurementId: "G-J1REBENTE9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const auth = getAuth(app);
export default app;