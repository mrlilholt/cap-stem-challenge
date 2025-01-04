import { db, auth } from './firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Load and Display Leaderboard Data
async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById("leaderboard-container");
    leaderboardContainer.innerHTML = ""; // Clear existing content

    const scoresRef = collection(db, "scores");
    const q = query(scoresRef, orderBy("submittedAt", "desc"));  // Order by most recent

    try {
        const querySnapshot = await getDocs(q);
        const latestScores = new Map();

        querySnapshot.forEach((doc) => {
            const user = doc.data();
            // If user isn't already in the map, add their most recent score
            if (!latestScores.has(user.uid) || user.submittedAt.toMillis() > latestScores.get(user.uid).submittedAt.toMillis()) {
                latestScores.set(user.uid, user);
            }
        });

        // Convert map to array and sort by score
        const sortedScores = Array.from(latestScores.values()).sort((a, b) => b.score - a.score);

        sortedScores.forEach((user) => {
            const userElement = document.createElement("div");
            userElement.classList.add("leaderboard-item");

            userElement.innerHTML = `
                <div class="leaderboard-row">
                    <img src="https://ui-avatars.com/api/?name=${user.username}" class="leaderboard-avatar" alt="${user.username}" />
                    <span class="username">${user.username || "Unknown"}</span>
                    <span class="score">${user.score} Points</span>
                </div>
            `;
            leaderboardContainer.appendChild(userElement);
        });

        if (sortedScores.length === 0) {
            leaderboardContainer.innerHTML = "<p>No scores available yet. Be the first!</p>";
        }
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardContainer.innerHTML = "<p>Error loading leaderboard. Please try again.</p>";
    }
}

// Show login button if not authenticated
onAuthStateChanged(auth, (user) => {
    const loginButton = document.getElementById("login-button");
    const leaderboardSection = document.getElementById("leaderboard-section");

    if (user) {
        loginButton.style.display = "none";
        leaderboardSection.style.display = "block";
        loadLeaderboard();
    } else {
        loginButton.style.display = "block";
        leaderboardSection.style.display = "none";
    }
});

// Handle login button click
window.login = function() {
    auth.signInWithPopup(provider).then(() => {
        loadLeaderboard();
    }).catch((error) => {
        console.error("Login failed:", error);
    });
};

window.onload = loadLeaderboard;
