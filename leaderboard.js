import { db } from './firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById("leaderboard");
    leaderboardContainer.innerHTML = "";

    try {
        const leaderboardQuery = query(
            collection(db, "scores"),
            orderBy("score", "desc")
        );

        const snapshot = await getDocs(leaderboardQuery);

        snapshot.forEach((doc) => {
            const data = doc.data();
            const entry = document.createElement("div");
            entry.classList.add("leaderboard-entry");
            entry.innerHTML = `${data.username}: ${data.score} points`;
            leaderboardContainer.appendChild(entry);
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}

window.onload = loadLeaderboard;
