/**
 * TARGETED SEEDING SCRIPT: NIGHT CANTEEN
 * Only seeds canteen items to avoid re-seeding the entire database.
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    setDoc,
    doc,
    serverTimestamp
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

const canteenItems = [
    { name: 'Maggi Noodles', price: 40, category: 'Meals', description: 'Classic Masala Maggi', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500' },
    { name: 'Classic Salted Lays', price: 20, category: 'Snacks', description: 'Large pack of salted chips', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500' },
    { name: 'Coca Cola 250ml', price: 30, category: 'Drinks', description: 'Chilled soft drink', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' },
    { name: 'Cheese Sandwich', price: 50, category: 'Meals', description: 'Grilled cheese sandwich', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500' },
    { name: 'Red Bull', price: 110, category: 'Drinks', description: 'Energy drink', image: 'https://images.unsplash.com/photo-1533558701576-23c65eec261f?w=500' },
    { name: 'Oreo Biscuits', price: 30, category: 'Snacks', description: 'Chocolate cream biscuits', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500' },
    { name: 'Chocolate Muffin', price: 45, category: 'Desserts', description: 'Soft chocolate muffin', image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500' },
    { name: 'Cold Coffee', price: 60, category: 'Drinks', description: 'Creamy iced coffee', image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=500' },
    { name: 'Kurkure Masala', price: 20, category: 'Snacks', description: 'Spicy corn puffs', image: 'https://images.unsplash.com/photo-1600490033465-05f3295e8e3c?w=500' },
    { name: 'Veg Burger', price: 75, category: 'Meals', description: 'Mixed veg patty burger', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500' }
];

async function seedCanteen() {
    console.log('🍔 Seeding Night Canteen Items Only...');

    let count = 0;
    for (const item of canteenItems) {
        const itemId = item.name.toLowerCase().replace(/\s+/g, '_');
        await setDoc(doc(db, 'canteenItems', itemId), {
            ...item,
            isAvailable: true,
            stock: 100,
            updatedAt: serverTimestamp()
        }, { merge: true });
        console.log(`  ✓ Seeded: ${item.name}`);
        count++;
    }

    console.log(`\n✅ Successfully seeded ${count} canteen items.`);
    process.exit(0);
}

seedCanteen().catch(err => {
    console.error('❌ SEEDING FAILED:', err);
    process.exit(1);
});
