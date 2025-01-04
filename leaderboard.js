import { db, auth, provider } from './firebase.js';
import { collection, getDocs, orderBy, query, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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
            
            // Ensure user photoURL and username are correctly set
            if (!user.photoURL) {
                user.photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || "Unknown")}`;
            }

            // Store most recent score for each user
            if (!latestScores.has(user.uid) || user.submittedAt.toMillis() > latestScores.get(user.uid).submittedAt.toMillis()) {
                latestScores.set(user.uid, user);
            }
        });

        // Sort by highest score after filtering latest entries
        const sortedScores = Array.from(latestScores.values()).sort((a, b) => b.score - a.score);

        sortedScores.forEach((user) => {
            const userElement = document.createElement("div");
            userElement.classList.add("leaderboard-item");

            userElement.innerHTML = `
                <div class="leaderboard-row">
                    <img src="${user.photoURL}" 
                         class="leaderboard-avatar" 
                         alt="${user.username || 'Unknown'}" />
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
    auth.signInWithPopup(provider).then(async (result) => {
        const user = result.user;

        // Store user info in Firestore if not already present
        const userRef = collection(db, "users");
        await setDoc(doc(userRef, user.uid), {
            username: user.displayName,
            photoURL: user.photoURL,
            email: user.email
        }, { merge: true });

        loadLeaderboard();
    }).catch((error) => {
        console.error("Login failed:", error);
    });
};

// Ensure leaderboard loads on page load
window.onload = () => {
    loadLeaderboard();
};
