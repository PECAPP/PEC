/**
 * Firebase Authentication Cleanup Script
 * 
 * This script deletes ALL users from Firebase Authentication
 * Use with EXTREME caution!
 * 
 * Usage: node scripts/cleanupAuth.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, listUsers, deleteUser } from 'firebase/auth';

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
const auth = getAuth(app);

console.log('⚠️  WARNING: This will delete ALL users from Firebase Authentication!');
console.log('⚠️  This action cannot be undone!');
console.log('');
console.log('❌ ERROR: Firebase Client SDK does not support listing/deleting users');
console.log('');
console.log('You have 2 options:');
console.log('');
console.log('Option 1: Manual Deletion (Easiest)');
console.log('  1. Go to Firebase Console → Authentication → Users');
console.log('  2. Select all users');
console.log('  3. Click "⋮" menu → Delete users');
console.log('');
console.log('Option 2: Delete one-by-one via Firebase Console');
console.log('  1. Go to Firebase Console → Authentication → Users');
console.log('  2. Click each user → Delete');
console.log('');
console.log('After deletion, run: node scripts/seedDatabase.js');
