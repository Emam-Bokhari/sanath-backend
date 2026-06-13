import admin from "firebase-admin";
import config from ".";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: config.firebase.clientEmail,
    }),
  });
}

export const firebaseAdmin = admin;
