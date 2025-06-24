const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com' // Add your project URL
});

async function setAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    // Set both the custom claim AND update Firestore
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    // Also update Firestore for easier frontend access
    await admin.firestore().collection('users').doc(user.uid).set(
      { admin: true },
      { merge: true }
    );
    
    console.log(`Success! ${email} is now an admin. Claims updated in Auth and Firestore.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setAdmin(process.argv[2]);