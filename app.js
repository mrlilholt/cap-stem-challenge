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
        score = userScoreSnap.data().score || 0;
        localStorage.setItem("userScore", score);  // Store the score in localStorage
    } else {
        await setDoc(userScoreRef, { score: 0 });
        score = 0;
        localStorage.setItem("userScore", 0);
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
        const points = currentMushroom.difficulty === "easy" ? 1 : currentMushroom.difficulty === "medium" ? 5 : 10;
        score += points;
        document.getElementById("result").innerText = `Correct! +${points} Points`;

        await updateUserScore(points);
        loadRandomMushroom();
    } else {
        score--;
        document.getElementById("result").innerText = "Incorrect. -1 Point";
        document.getElementById("score").innerText = score;
        await updateUserScore(-1);
    }
    document.getElementById("score").innerText = score;
    localStorage.setItem("userScore", score);  // Ensure score updates immediately in localStorage
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

// Preserve Score Across Page Loads
window.onload = () => {
    const savedScore = localStorage.getItem("userScore");
    if (savedScore !== null) {
        score = parseInt(savedScore, 10);
        document.getElementById("score").innerText = score;
    }
    loadRandomMushroom();
};

// Logout and Clear Score
window.logout = () => {
    localStorage.removeItem("userScore");  // Reset local storage on logout
    auth.signOut().then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Logout failed:", error);
    });
};

window.submitGuess = submitGuess;
