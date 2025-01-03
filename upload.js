import { storage, db } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

window.uploadMushroom = function() {
    const file = document.getElementById("imageUpload").files[0];
    const partType = document.getElementById("partType").value;
    const genus = document.getElementById("uploadGenus").value;
    const species = document.getElementById("uploadSpecies").value;

    if (!file || !genus || !species) {
        alert("Please fill in all fields.");
        return;
    }

    // Correct way to create storage reference
    const storageRef = ref(storage, `mushrooms/${partType}/${file.name}`);
    
    // Upload the file
    uploadBytes(storageRef, file).then((snapshot) => {
        // Get the download URL
        getDownloadURL(snapshot.ref).then((downloadURL) => {
            // Add to Firestore collection
            db.collection("mushrooms").add({
                imageUrl: downloadURL,
                partType,
                genus,
                species,
                uploadedAt: new Date()
            }).then(() => {
                alert("Mushroom uploaded successfully!");
                document.getElementById("upload-form").reset();
            });
        });
    }).catch((error) => {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
    });
}
