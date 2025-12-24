import * as admin from 'firebase-admin';
admin.initializeApp({ projectId: 'luach-web' });
const db = admin.firestore();
async function run() {
    const usersSnap = await db.collection('users').get();
    for (const userDoc of usersSnap.docs) {
        console.log('User:', userDoc.id);
        const settingsSnap = await userDoc.ref.collection('settings').doc('general').get();
        console.log('Settings:', settingsSnap.data());
        const eventsSnap = await userDoc.ref.collection('events').get();
        console.log('Events count:', eventsSnap.size);
        eventsSnap.docs.forEach(doc => {
            const e = doc.data();
            console.log(` - ${e.name} | Type: ${e.type} | Date: ${e.jMonth}/${e.jDay}/${e.jYear} | RemindOf: ${e.remindDayOf}`);
        });
    }
}
run();
