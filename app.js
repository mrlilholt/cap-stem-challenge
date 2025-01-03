import { auth, provider } from './firebase.js';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Google Login
export function login() {
    signInWithPopup(auth, provider)  // Use imported provider directly
    .then((result) => {
        document.getElementById("login").style.display = "none";
        document.getElementById("game").style.display = "block";
    })
    .catch((error) => {
        console.error("Login failed:", error);
    });
}

// Attach to Window (for onclick)
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

// Load Random Mushroom for Guessing
import { db } from './firebase.js';

let currentMushroom;
let score = 0;

export function loadRandomMushroom() {
    db.collection("mushrooms").get().then((snapshot) => {
        const mushrooms = snapshot.docs.map(doc => doc.data());
        if (mushrooms.length > 0) {
            currentMushroom = mushrooms[Math.floor(Math.random() * mushrooms.length)];
            document.getElementById("mushroom-image").src = currentMushroom.imageUrl;
        } else {
            alert("No mushrooms found.");
        }
    });
}

export function submitGuess() {
    const genus = document.getElementById("genus").value.toLowerCase();
    const species = document.getElementById("species").value.toLowerCase();

    if (genus === currentMushroom.genus.toLowerCase() && species === currentMushroom.species.toLowerCase()) {
        score++;
        document.getElementById("result").innerText = "Correct! +1 Point";
    } else {
        score--;
        document.getElementById("result").innerText = "Incorrect. -1 Point";
    }
    document.getElementById("score").innerText = score;
    loadRandomMushroom();
}

// Store Score in Firestore
export function saveScore(username) {
    db.collection("scores").add({
        username,
        score,
        submittedAt: new Date()
    }).then(() => {
        console.log("Score saved!");
    }).catch((error) => {
        console.error("Failed to save score:", error);
    });
}

window.onload = loadRandomMushroom;

