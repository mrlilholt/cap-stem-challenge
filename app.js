import { auth, provider, db } from './firebase.js';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
export async function submitGuess() {
    const genus = document.getElementById("genus").value.toLowerCase();
    const species = document.getElementById("species").value.toLowerCase();

    if (currentMushroom &&
        genus === currentMushroom.genus.toLowerCase() &&
        species === currentMushroom.species.toLowerCase()) {
        
        const points = getPoints();
        score += points;
        document.getElementById("result").innerText = `Correct! +${points} Points`;
    } else {
        score--;
        document.getElementById("result").innerText = "Incorrect. -1 Point";
    }
    document.getElementById("score").innerText = score;

    // Save score to Firestore if user is logged in
    if (auth.currentUser) {
        const user = auth.currentUser;

        await addDoc(collection(db, "scores"), {
            uid: user.uid,
            email: user.email,
            score: score,
            submittedAt: new Date()
        });
    } else {
        console.warn("No user logged in. Score not saved.");
    }

    loadRandomMushroom();
}

// Fetch and Display Leaderboard (Top 50)
export async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById("leaderboard");
    leaderboardContainer.innerHTML = ''; // Clear existing list

    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(50));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const listItem = document.createElement("li");
        listItem.innerText = `${data.email}: ${data.score} points`;
        leaderboardContainer.appendChild(listItem);
    });
}

// Determine Points Based on Difficulty
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

// Load leaderboard on leaderboard.html
if (window.location.pathname.includes('leaderboard.html')) {
    loadLeaderboard();
}

// Initial Mushroom Load
window.onload = loadRandomMushroom;
