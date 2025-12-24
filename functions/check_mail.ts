import * as admin from 'firebase-admin';
admin.initializeApp({ projectId: 'luach-web' });
const db = admin.firestore();
async function run() {
    const mailSnap = await db.collection('mail').limit(5).get();
    console.log('Mail docs found:', mailSnap.size);
    mailSnap.docs.forEach(doc => console.log(doc.id, doc.data().to, doc.data().message?.subject));
}
run();
