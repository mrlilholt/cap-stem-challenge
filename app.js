import { auth, provider, db } from './firebase.js';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let currentMushroom;
let score = 0;

// Google Login
export function login() {
    signInWithPopup(auth, provider)
    .then(() => {
        document.getElementById("login").style.display = "none";
        document.getElementById("game").style.display = "block";
    }).catch((error) => {
        console.error("Login failed:", error);
    });
}

window.login = login;

// Load Random Mushroom
export function loadRandomMushroom() {
    db.collection("mushrooms").get().then((snapshot) => {
        const mushrooms = snapshot.docs.map(doc => doc.data());
        if (mushrooms.length > 0) {
            currentMushroom = mushrooms[Math.floor(Math.random() * mushrooms.length)];
            const mushroomImageElement = document.getElementById("mushroom-image");
            mushroomImageElement.src = currentMushroom.imageUrl;
            mushroomImageElement.alt = `${currentMushroom.genus} ${currentMushroom.species}`;
        }
    }).catch((error) => {
        console.error("Error loading mushrooms:", error);
    });
}

window.onload = loadRandomMushroom;
