// setAdmin.js
const admin = require("firebase-admin");

// Import your service account key
const serviceAccount = require("./serviceAccountKey.json"); // ✅ File must be in same folder

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// The email of the user you want to make admin
const targetEmail = "Abhilashbadiger9988@gmail.com"; // ✅ Change this to your Firebase user's email

// Set admin claim
admin.auth().getUserByEmail(targetEmail)
  .then(user => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`✅ Admin claim successfully set for ${targetEmail}`);
  })
  .catch(error => {
    console.error("❌ Error setting admin claim:", error);
  });
