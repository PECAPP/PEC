/**
 * TARGETED SEEDING SCRIPT: HOSTEL ISSUES
 * Seeds initial issues for testing the student and admin interfaces.
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    setDoc,
    doc,
    serverTimestamp,
    Timestamp
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

const studentId = "WjAnbN1XyNVD9xVzVfXN1vXN1vXN"; // Placeholder, normally dynamic
const studentName = "Arjun Patel";

const issues = [
    {
        title: 'AC not cooling properly',
        description: 'The air conditioner in my room is running but not cooling. The temperature stays the same even after hours of running.',
        category: 'hvac',
        priority: 'high',
        status: 'in_progress',
        roomNumber: 'A-204',
        studentId: '25111001', // Using Student ID as string ID reference
        studentName: 'Amit Nair',
        responses: [
            { from: 'Maintenance Team', message: 'We have scheduled a technician visit for tomorrow between 10 AM - 12 PM.', timestamp: new Date(Date.now() - 86400000) },
        ]
    },
    {
        title: 'WiFi connectivity issues',
        description: 'WiFi signal is very weak in my room. Unable to attend online classes properly.',
        category: 'internet',
        priority: 'medium',
        status: 'open',
        roomNumber: 'A-204',
        studentId: '25111001',
        studentName: 'Amit Nair',
    },
    {
        title: 'Leaking tap in bathroom',
        description: 'The bathroom tap is leaking continuously, wasting water.',
        category: 'plumbing',
        priority: 'medium',
        status: 'resolved',
        roomNumber: 'B-102',
        studentId: '25111002',
        studentName: 'Priya Sharma',
        responses: [
            { from: 'Maintenance Team', message: 'Issue has been fixed. Please confirm if the problem persists.', timestamp: new Date(Date.now() - 172800000) },
            { from: 'Priya Sharma', message: 'Fixed. Thank you!', timestamp: new Date(Date.now() - 152800000) },
        ]
    }
];

async function seedHostelIssues() {
    console.log('🔧 Seeding Hostel Issues...');

    let count = 0;
    for (const issue of issues) {
        const issueId = `issue_${Date.now()}_${count}`;
        await setDoc(doc(db, 'hostelIssues', issueId), {
            ...issue,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log(`  ✓ Seeded: ${issue.title}`);
        count++;
    }

    console.log(`\n✅ Successfully seeded ${count} hostel issues.`);
    process.exit(0);
}

seedHostelIssues().catch(err => {
    console.error('❌ SEEDING FAILED:', err);
    process.exit(1);
});
