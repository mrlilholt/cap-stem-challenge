import { db } from './firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById("leaderboard");
    leaderboardContainer.innerHTML = "";

    try {
        const leaderboardQuery = query(
            collection(db, "scores"),  // Pull from scores collection
            orderBy("score", "desc")   // Order by highest score
        );

        const snapshot = await getDocs(leaderboardQuery);

        snapshot.forEach((doc) => {
            const data = doc.data();
            const entry = document.createElement("div");
            entry.classList.add("leaderboard-entry");
            
            // Display user profile picture, name, and score
            entry.innerHTML = `
                <div class="leaderboard-item">
                    <img src="${data.photoURL || 'default-profile.png'}" alt="User Photo" class="user-photo">
                    <span>${data.username || 'Anonymous'}: ${data.score} points</span>
                </div>
            `;
            leaderboardContainer.appendChild(entry);
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}

window.onload = loadLeaderboard;
