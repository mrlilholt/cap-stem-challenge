import { auth, provider, db } from './firebase.js';
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let currentMushroom;
let score = 0;

// Google Login
export function login() {
    signInWithPopup(auth, provider)
        .then(() => {
            document.getElementById("login").style.display = "none";
            document.getElementById("game").style.display = "block";
            fetchUserScore();  // Fetch user score immediately after login
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
        fetchUserScore();  // Ensure score is loaded when user is authenticated
    }
});

// Fetch and Set User Score from Firestore
async function fetchUserScore() {
    if (!auth.currentUser) return;

    const userScoreRef = doc(db, "scores", auth.currentUser.uid);
    const userScoreSnap = await getDoc(userScoreRef);

    if (userScoreSnap.exists()) {
        score = userScoreSnap.data().score || 0;
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

    if (!currentMushroom) return;

    if (genus === currentMushroom.genus.toLowerCase() && species === currentMushroom.species.toLowerCase()) {
        const points = parseInt(currentMushroom.difficulty) || 1;  // Use mushroom difficulty for points
        score += points;
        document.getElementById("result").innerText = `Correct! +${points} Points`;
    } else {
        score -= 1;  // Deduct 1 point for incorrect guesses
        document.getElementById("result").innerText = "Incorrect. -1 Point";
    }

    await updateUserScore();  // Update Firestore with new score
document.getElementById("score").innerText = score;  // Update UI after Firestore update
loadRandomMushroom();  // Load next mushroom
}

// Update User Score in Firestore
async function updateUserScore() {
    if (!auth.currentUser) return;

    const userScoreRef = doc(db, "scores", auth.currentUser.uid);
    await updateDoc(userScoreRef, {
        score: score,
        submittedAt: new Date()
    }).catch(async () => {
        await setDoc(userScoreRef, { score: score, submittedAt: new Date() });
    });
}

window.submitGuess = submitGuess;
window.onload = loadRandomMushroom;
