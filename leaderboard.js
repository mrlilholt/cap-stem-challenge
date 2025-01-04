import { db } from './firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Load and Display Leaderboard Data
async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById("leaderboard-container");
    leaderboardContainer.innerHTML = ""; // Clear existing content

    const scoresRef = collection(db, "scores");
    const q = query(scoresRef, orderBy("score", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            const userElement = document.createElement("div");
            userElement.classList.add("leaderboard-item");

            userElement.innerHTML = `
                <div class="leaderboard-row">
                    <img src="https://ui-avatars.com/api/?name=${user.username}" class="leaderboard-avatar" alt="${user.username}" />
                    <span class="username">${user.username}</span>
                    <span class="score">${user.score} Points</span>
                </div>
            `;
            leaderboardContainer.appendChild(userElement);
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardContainer.innerHTML = "<p>Error loading leaderboard. Please try again.</p>";
    }
}

window.onload = loadLeaderboard;
