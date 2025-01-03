import { auth, provider, db } from './firebase.js';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Google Login
export function login() {
    signInWithPopup(auth, provider)
    .then((result) => {
        document.getElementById("login").style.display = "none";
        document.getElementById("game").style.display = "block";
    })
    .catch((error) => {
        console.error("Login failed:", error);
    });
}

window.login = login;

// Upload Mushroom to Firestore and Storage
export function uploadMushroom() {
    const file = document.getElementById("imageUpload").files[0];
    const partType = document.getElementById("partType").value;
    const genus = document.getElementById("uploadGenus").value;
    const species = document.getElementById("uploadSpecies").value;

    if (!file || !genus || !species) {
        alert("Please fill in all fields.");
        return;
    }

    const storageRef = storage.ref(`mushrooms/${partType}/${file.name}`);
    storageRef.put(file).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
            db.collection("mushrooms").add({
                imageUrl: downloadURL,
                partType,
                genus,
                species,
                uploadedAt: new Date()
            }).then(() => {
                alert("Mushroom uploaded successfully!");
            });
        });
    }).catch((error) => {
        console.error("Upload failed:", error);
    });
}

let currentMushroom;
let score = 0;

// Load Random Mushroom with Optional Difficulty Filter
export async function loadRandomMushroom() {
    const selectedDifficulty = document.getElementById("difficultyFilter").value;
    const mushroomsCollection = collection(db, "mushrooms");

    try {
        const snapshot = await getDocs(mushroomsCollection);
        const allMushrooms = snapshot.docs.map(doc => doc.data());

        // Filter mushrooms based on selected difficulty
        let mushrooms = allMushrooms;
        if (selectedDifficulty !== "random") {
            mushrooms = allMushrooms.filter(mushroom => mushroom.difficulty === selectedDifficulty);
        }

        if (mushrooms.length > 0) {
            currentMushroom = mushrooms[Math.floor(Math.random() * mushrooms.length)];
            document.getElementById("mushroom-image").src = currentMushroom.imageUrl;
        } else {
            alert("No mushrooms found for this difficulty. Try uploading more!");
        }
    } catch (error) {
        console.error("Error loading mushrooms:", error);
    }
}

// Handle Mushroom Guess and Scoring
export function submitGuess() {
    const genus = document.getElementById("genus").value.toLowerCase();
    const species = document.getElementById("species").value.toLowerCase();

    let pointValue = 1;  // Default to easy
    if (currentMushroom.difficulty === "medium") {
        pointValue = 5;
    } else if (currentMushroom.difficulty === "difficult") {
        pointValue = 10;
    }

    if (genus === currentMushroom.genus.toLowerCase() && species === currentMushroom.species.toLowerCase()) {
        score += pointValue;
        document.getElementById("result").innerText = `Correct! +${pointValue} Points`;
    } else {
        score -= pointValue;
        document.getElementById("result").innerText = `Incorrect. -${pointValue} Points`;
    }
    document.getElementById("score").innerText = score;
    loadRandomMushroom();
}

// Attach to window for testing
window.submitGuess = submitGuess;

// Load the first random mushroom on page load
window.onload = loadRandomMushroom;

// Reload a mushroom when the difficulty filter changes
document.getElementById("difficultyFilter").addEventListener("change", loadRandomMushroom);
