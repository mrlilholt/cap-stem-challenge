import { storage, db } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

export function uploadMushroom() {
    const file = document.getElementById("imageUpload").files[0];
    const partType = document.getElementById("partType").value;
    const genus = document.getElementById("uploadGenus").value;
    const species = document.getElementById("uploadSpecies").value;
    const difficulty = document.getElementById("difficulty").value;

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
                difficulty,
                uploadedAt: new Date()
            }).then(() => {
                alert("Mushroom uploaded successfully!");
            });
        });
    }).catch((error) => {
        console.error("Upload failed:", error);
    });
}