// Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAn89gsy3bcj6j1wGp_mEvdoGaYh9XyJAg",
    authDomain: "cap-stem-challenge.firebaseapp.com",
    projectId: "cap-stem-challenge",
    storageBucket: "cap-stem-challenge.firebasestorage.app",
    messagingSenderId: "286470006062",
    appId: "1:286470006062:web:78e1472fc313d88f2206bf",
    measurementId: "G-FZLR2BVWRD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

// Export auth and provider
export { auth, provider, db, storage };
