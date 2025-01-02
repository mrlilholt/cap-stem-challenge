// Firebase configuration using Netlify environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
  const analytics = firebase.analytics();
  
  // Google Login
  function login() {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
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
  function uploadMushroom() {
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
  window.uploadMushroom = uploadMushroom;
  
  // Load Random Mushroom for Guessing
  let currentMushroom;
  
  function loadRandomMushroom() {
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
  window.onload = loadRandomMushroom;
  
  // Submit Guess for Mushroom
  function submitGuess() {
      const genus = document.getElementById("genus").value.toLowerCase();
      const species = document.getElementById("species").value.toLowerCase();
  
      if (genus === currentMushroom.genus.toLowerCase() && species === currentMushroom.species.toLowerCase()) {
          document.getElementById("result").innerText = "Correct! +1 Point";
      } else {
          document.getElementById("result").innerText = "Incorrect. -1 Point";
      }
      loadRandomMushroom();
  }
  window.submitGuess = submitGuess;
  