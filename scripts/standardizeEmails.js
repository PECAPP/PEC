
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    doc,
    query,
    where
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCcsupbQB5vNlZGfTFXUxq5q7SKBry5ntM",
    authDomain: "omniflow-8933a.firebaseapp.com",
    projectId: "omniflow-8933a",
    storageBucket: "omniflow-8933a.firebasestorage.app",
    messagingSenderId: "250987767866",
    appId: "1:250987767866:web:a746b33b2eea130a772d03",
    measurementId: "G-04S0V5GJ4N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function standardizeEmails() {
    console.log('🧹 Starting Email Standardization (Firestore only)...');

    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'student'));
        const querySnapshot = await getDocs(q);

        console.log(`Found ${querySnapshot.size} students.`);

        const updatePromises = [];
        const emailMap = new Map();

        for (const userDoc of querySnapshot.docs) {
            const data = userDoc.data();
            const fullName = data.fullName || '';
            const uid = userDoc.id;

            if (!fullName) continue;

            // Generate clean email: firstname.lastname@pec.edu
            const parts = fullName.toLowerCase().trim().split(/\s+/);
            const firstName = parts[0] || 'student';
            const lastName = parts[parts.length - 1] || '';

            let baseEmail = lastName ? `${firstName}.${lastName}` : firstName;

            // Handle duplicates
            let finalEmail = `${baseEmail}@pec.edu`;
            let counter = 1;
            while (emailMap.has(finalEmail)) {
                finalEmail = `${baseEmail}${counter}@pec.edu`;
                counter++;
            }
            emailMap.set(finalEmail, uid);

            console.log(`  🔄 ${fullName.padEnd(20)} : ${data.email.padEnd(35)} -> ${finalEmail}`);

            updatePromises.push(updateDoc(doc(db, 'users', uid), {
                email: finalEmail
            }));
        }

        await Promise.all(updatePromises);
        console.log('\n✅ Successfully updated all student emails in Firestore!');
        console.log('Note: This only updates the display email. Original login credentials remain active.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Refactor failed:', error);
        process.exit(1);
    }
}

standardizeEmails();
