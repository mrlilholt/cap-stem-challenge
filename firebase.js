// Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
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

// Handle User Login State
window.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        const userInfoDiv = document.getElementById('user-info');
        const loginSection = document.getElementById('login-section');
        const gameContainer = document.getElementById('game-container');

        if (user) {
            // User is logged in
            document.getElementById('user-photo').src = user.photoURL || './default-user.png';
            document.getElementById('user-name').textContent = user.displayName || 'Guest';
            userInfoDiv.style.display = 'flex';
            gameContainer.style.display = 'block';  // Show game after login
            if (loginSection) loginSection.style.display = 'none';
        } else {
            // User is not logged in
            userInfoDiv.style.display = 'none';
            gameContainer.style.display = 'none';
            if (loginSection) loginSection.style.display = 'block';
        }
    });
});

// Google Login Function
window.login = function () {
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user;
        document.getElementById('user-photo').src = user.photoURL;
        document.getElementById('user-name').textContent = user.displayName;
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('game-container').style.display = 'block';
        if (document.getElementById('login-section')) {
            document.getElementById('login-section').style.display = 'none';
        }
    }).catch((error) => {
        console.error("Login failed:", error);
    });
}

// Logout Function
window.logout = function () {
    signOut(auth).then(() => {
        alert("Logged out successfully!");
        window.location.href = 'index.html';  // Redirect to home page
    }).catch((error) => {
        console.error("Logout failed:", error);
    });
}

// Export for Use in Other Files
export { auth, provider, db, storage };
