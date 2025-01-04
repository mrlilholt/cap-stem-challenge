import { auth, provider, db } from './firebase.js';
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let currentMushroom;
let score = 0;

// Google Login
export function login() {
    signInWithPopup(auth, provider)
        .then(() => {
            document.getElementById("login-section").style.display = "none";
            document.getElementById("main-container").style.display = "block";
            fetchUserScore();
        })
        .catch((error) => {
            console.error("Login failed:", error);
        });
}

window.login = login;

// Display User Info and Toggle Content Based on Authentication
onAuthStateChanged(auth, (user) => {
    const gameContainer = document.querySelector(".container");
    const loginSection = document.getElementById("login-section");
    const userInfo = document.getElementById("user-info");

    if (user) {
        document.getElementById("user-photo").src = user.photoURL || 'default-avatar.png';
        document.getElementById("user-name").textContent = user.displayName || 'Unknown User';
        loginSection.style.display = "none";
        gameContainer.style.display = "block";
        userInfo.style.display = "flex";
        fetchUserScore();
    } else {
        loginSection.style.display = "block";
        gameContainer.style.display = "none";
        userInfo.style.display = "none";
    }
});

// Fetch and Set User Score from Firestore
async function fetchUserScore() {
    if (!auth.currentUser) return;

    const userScoreRef = doc(db, "scores", auth.currentUser.uid);
    const userScoreSnap = await getDoc(userScoreRef);

    if (userScoreSnap.exists()) {
        score = userScoreSnap.data().score || 0;
        localStorage.setItem("userScore", score);
    } else {
        await setDoc(userScoreRef, { score: 0 });
        score = 0;
        localStorage.setItem("userScore", 0);
    }
    document.getElementById("score").innerText = score;
}

// Update User Score in Firestore
async function updateUserScore(points) {
    if (!auth.currentUser) return;

    const user = auth.currentUser;
    const userScoreRef = doc(db, "scores", user.uid);

    try {
        const userScoreSnap = await getDoc(userScoreRef);

        if (userScoreSnap.exists()) {
            // Update existing score and refresh username/photoURL
            const newScore = userScoreSnap.data().score + points;
            await updateDoc(userScoreRef, {
                score: newScore,
                username: user.displayName,  // Ensure username is updated
                photoURL: user.photoURL,     // Ensure photoURL is updated
                submittedAt: new Date()
            });
        } else {
            // Create a new score document with user info
            await setDoc(userScoreRef, {
                uid: user.uid,
                username: user.displayName,
                photoURL: user.photoURL,
                score: points,
                submittedAt: new Date()
            });
        }
    } catch (error) {
        console.error("Error updating score:", error);
    }
    loadLeaderboard();
}



// Load Random Mushroom and Display Difficulty Icon
export async function loadRandomMushroom() {
    try {
        const snapshot = await getDocs(collection(db, "mushrooms"));
        const mushrooms = snapshot.docs.map(doc => doc.data());

        if (mushrooms.length > 0) {
            currentMushroom = mushrooms[Math.floor(Math.random() * mushrooms.length)];
            const mushroomImageElement = document.getElementById("mushroom-image");
            mushroomImageElement.src = currentMushroom.imageUrl;
            mushroomImageElement.alt = `${currentMushroom.genus} ${currentMushroom.species}`;
            
            const difficultyIcon = document.getElementById("difficulty-icon");
            switch (currentMushroom.difficulty) {
                case 'easy':
                    difficultyIcon.src = "easy.png";
                    break;
                case 'medium':
                    difficultyIcon.src = "medium.png";
                    break;
                case 'hard':
                    difficultyIcon.src = "hard.png";
                    break;
                default:
                    difficultyIcon.src = "random.png";
            }
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
    localStorage.setItem("userScore", score);
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
    localStorage.removeItem("userScore");
    auth.signOut().then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Logout failed:", error);
    });
};

window.submitGuess = submitGuess;
