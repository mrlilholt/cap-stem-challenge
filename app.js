import { auth, provider, db } from './firebase.js';
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let currentMushroom;
let score = 0;

// Google Login
export function login() {
    signInWithPopup(auth, provider)
        .then(() => {
            document.getElementById("login").style.display = "none";
            document.getElementById("game").style.display = "block";
            fetchUserScore();
        })
        .catch((error) => {
            console.error("Login failed:", error);
        });
}

window.login = login;

// Display User Info
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("user-photo").src = user.photoURL;
        document.getElementById("user-name").textContent = user.displayName;
        fetchUserScore();
    }
});

// Fetch and Set User Score from Firestore
async function fetchUserScore() {
    if (!auth.currentUser) return;

    const userScoreRef = doc(db, "scores", auth.currentUser.uid);
    const userScoreSnap = await getDoc(userScoreRef);

    if (userScoreSnap.exists()) {
        score = userScoreSnap.data().score;
    } else {
        await setDoc(userScoreRef, { score: 0 });
        score = 0;
    }
    document.getElementById("score").innerText = score;
}

// Load Random Mushroom (Cloudinary)
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

    if (genus === currentMushroom.genus.toLowerCase() && species === currentMushroom.species.toLowerCase()) {
        const points = getPoints();
        score += points;
        document.getElementById("result").innerText = `Correct! +${points} Points`;
        
        // Update Firestore with new score
        await updateUserScore(points);
        
        // Immediately load a new mushroom after correct guess
        await loadRandomMushroom();
        
    } else {
        score--;
        document.getElementById("result").innerText = "Incorrect. -1 Point";
        document.getElementById("score").innerText = score;
        await updateUserScore(-1);
    }
    document.getElementById("score").innerText = score;
}

// Update User Score in Firestore
async function updateUserScore(points) {
    if (!auth.currentUser) return;

    const userScoreRef = doc(db, "scores", auth.currentUser.uid);
    
    try {
        const userScoreSnap = await getDoc(userScoreRef);
        if (userScoreSnap.exists()) {
            await updateDoc(userScoreRef, {
                score: score,
                submittedAt: new Date()
            });
        } else {
            await setDoc(userScoreRef, {
                score: points,
                submittedAt: new Date()
            });
        }
        
        // Log the score in the general "scores" collection for leaderboard
        await addDoc(collection(db, "scores"), {
            score: points,
            submittedAt: new Date(),
            username: auth.currentUser.displayName || "Anonymous"
        });

    } catch (error) {
        console.error("Error updating score:", error);
    }
}

// Calculate Points Based on Difficulty
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

window.submitGuess = submitGuess;
window.onload = loadRandomMushroom;
