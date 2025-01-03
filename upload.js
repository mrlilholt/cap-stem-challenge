import { storage, db } from './firebase.js';

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
                document.getElementById("upload-result").innerText = "Mushroom uploaded successfully!";
                document.getElementById("upload-form").reset();
            });
        });
    }).catch((error) => {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
    });
}
