import { db } from './firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Fetch and display leaderboard data
async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById("leaderboard-container");
    leaderboardContainer.innerHTML = "";  // Clear existing content

    try {
        const scoresQuery = query(collection(db, "scores"), orderBy("score", "desc"));
        const scoresSnapshot = await getDocs(scoresQuery);

        if (scoresSnapshot.empty) {
            leaderboardContainer.innerHTML = "<p>No scores available yet.</p>";
        } else {
            scoresSnapshot.forEach(doc => {
                const data = doc.data();
                const entry = document.createElement("div");
                entry.classList.add("leaderboard-entry");

                entry.innerHTML = `
                    <img src="${data.photoURL}" alt="User Photo" class="leaderboard-photo">
                    <span>${data.username} - ${data.score} pts</span>
                `;
                leaderboardContainer.appendChild(entry);
            });
        }
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardContainer.innerHTML = `<p>Error loading leaderboard. Please try again later.</p>`;
    }
}

// Load leaderboard on page load
window.onload = loadLeaderboard;
