import { db } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const cloudName = 'mrlilholt';  // Your Cloudinary cloud name
const uploadPreset = 'j6rx8tqb'; // Your Cloudinary upload preset

window.uploadMushroom = async function () {
    const file = document.getElementById('imageUpload').files[0];
    const partType = document.getElementById('partType').value;
    const genus = document.getElementById('uploadGenus').value;
    const species = document.getElementById('uploadSpecies').value;
    const difficulty = document.getElementById("difficulty").value;

    if (!file || !genus || !species) {
        alert("Please fill in all fields.");
        return;
    }

    // Prepare FormData to send to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        // Upload Image to Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.secure_url) {
            // Store the image URL and metadata in Firestore
            await addDoc(collection(db, "mushrooms"), {
                imageUrl: data.secure_url,
                partType,
                genus,
                species,
                difficulty,
                uploadedAt: new Date()
            });

            alert("Mushroom uploaded successfully!");
            document.getElementById('uploadForm').reset();
        } else {
            throw new Error('Failed to upload image to Cloudinary');
        }
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
    }
}

// Function to assign points during upload
function getPoints(difficulty) {
    switch (difficulty) {
        case "easy":
            return 1;
        case "medium":
            return 5;
        case "hard":
            return 10;
        default:
            return 1;
    }
}
