// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: `${process.env.FIREBASE_API_KEY}`,
    authDomain: `${process.env.FIREBASE_AUTH_DOMAIN}`,
    projectId: `${process.env.FIREBASE_PROJECT_ID}`,
    storageBucket: `${process.env.FIREBASE_STORAGE_BUCKET}`,
    messagingSenderId: `${process.env.FIREBASE_MESSAGING_SENDER_ID}`,
    appId: `${process.env.FIREBASE_APP_ID}`,
    measurementId: `${process.env.FIREBASE_MEASUREMENT_ID}`
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Google Login
export function login() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
    .then((result) => {
        document.getElementById("login").style.display = "none";
        document.getElementById("game").style.display = "block";
    })
    .catch((error) => {
        console.error("Login failed:", error);
    });
}

// Upload Mushroom to Firestore and Storage
export async function uploadMushroom() {
    const file = document.getElementById("imageUpload").files[0];
    const partType = document.getElementById("partType").value;
    const genus = document.getElementById("uploadGenus").value;
    const species = document.getElementById("uploadSpecies").value;

    if (!file || !genus || !species) {
        alert("Please fill in all fields.");
        return;
    }

    const storageRef = ref(storage, `mushrooms/${partType}/${file.name}`);
    
    try {
        // Upload file to Storage
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Save metadata to Firestore
        await addDoc(collection(db, "mushrooms"), {
            imageUrl: downloadURL,
            partType,
            genus,
            species,
            uploadedAt: new Date()
        });

        alert("Mushroom uploaded successfully!");
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload mushroom.");
    }
}

// Load Random Mushroom for Guessing
let currentMushroom;

export async function loadRandomMushroom() {
    const snapshot = await getDocs(collection(db, "mushrooms"));
    const mushrooms = snapshot.docs.map(doc => doc.data());

    if (mushrooms.length > 0) {
        currentMushroom = mushrooms[Math.floor(Math.random() * mushrooms.length)];
        document.getElementById("mushroom-image").src = currentMushroom.imageUrl;
    } else {
        alert("No mushrooms found.");
    }
}

// Submit Guess for Mushroom
export function submitGuess() {
    const genus = document.getElementById("genus").value.toLowerCase();
    const species = document.getElementById("species").value.toLowerCase();

    if (genus === currentMushroom.genus.toLowerCase() && species === currentMushroom.species.toLowerCase()) {
        document.getElementById("result").innerText = "Correct! +1 Point";
    } else {
        document.getElementById("result").innerText = "Incorrect. -1 Point";
    }
    loadRandomMushroom();
}

// Load Mushroom on Page Load
window.onload = loadRandomMushroom;
