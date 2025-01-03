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

// Load Random Mushroom (with Cloudinary URLs)
export async function loadRandomMushroom() {
    try {
        const snapshot = await getDocs(collection(db, "mushrooms"));
        const mushrooms = snapshot.docs.map(doc => doc.data());
        
        if (mushrooms.length > 0) {
            currentMushroom = mushrooms[Math.floor(Math.random() * mushrooms.length)];
            const mushroomImageElement = document.getElementById("mushroom-image");
            mushroomImageElement.src = currentMushroom.imageUrl;
            mushroomImageElement.alt = `${currentMushroom.genus} ${currentMushroom.species}`;
        } else {
            alert("No mushrooms found.");
        }
    } catch (error) {
        console.error("Error loading mushrooms:", error);
    }
}

// Handle Guess Submission
export function submitGuess() {
    const genus = document.getElementById("genus").value.toLowerCase();
    const species = document.getElementById("species").value.toLowerCase();

    if (genus === currentMushroom.genus.toLowerCase() && species === currentMushroom.species.toLowerCase()) {
        score += getPoints();
        document.getElementById("result").innerText = `Correct! +${getPoints()} Points`;
    } else {
        score--;
        document.getElementById("result").innerText = "Incorrect. -1 Point";
    }
    document.getElementById("score").innerText = score;
    loadRandomMushroom();
}

function getPoints() {
    const difficulty = document.getElementById("difficulty").value;
    switch (difficulty) {
        case "easy":
            return 1;
        case "medium":
            return 5;
        case "hard":
            return 10;
        default:
            return 1; // Default for random
    }
}

window.onload = loadRandomMushroom;
