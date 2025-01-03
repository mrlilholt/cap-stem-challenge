import { db } from './firebase.js';

const leaderboardList = document.getElementById("leaderboard");

// Fetch scores from Firestore
db.collection("scores")
    .orderBy("score", "desc")
    .limit(10)
    .get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            const data = doc.data();
            const li = document.createElement("li");
            li.textContent = `${data.username}: ${data.score} points`;
            leaderboardList.appendChild(li);
        });
    })
    .catch((error) => {
        console.error("Error loading leaderboard:", error);
    });
