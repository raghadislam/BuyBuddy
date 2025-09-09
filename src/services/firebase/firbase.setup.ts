import admin from "firebase-admin";

import env from "../../config/env.config";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FB_PROJECT_ID,
    clientEmail: env.FB_CLIENT_EMAIL,
    privateKey: env.FB_PRIVATE_KEY,
  }),
});

const fcm = admin.messaging();
export default fcm;
