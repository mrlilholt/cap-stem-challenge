// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAn89gsy3bcj6j1wGp_mEvdoGaYh9XyJAg",
    authDomain: "cap-stem-challenge.firebaseapp.com",
    projectId: "cap-stem-challenge",
    storageBucket: "cap-stem-challenge.appspot.com",
    messagingSenderId: "286470006062",
    appId: "1:286470006062:web:78e1472fc313d88f2206bf",
    measurementId: "G-FZLR2BVWRD"
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
  