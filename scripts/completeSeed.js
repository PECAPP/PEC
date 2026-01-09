/**
 * COMPLETE ALL MISSING DATA SEEDING
 * Run this AFTER comprehensiveSeed.js to populate missing enrollments, grades, and attendance
 * 
 * Usage: node scripts/completeSeed.js
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    setDoc,
    doc,
    serverTimestamp,
    Timestamp,
    getDocs,
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

// Helper functions
const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return Timestamp.fromDate(date);
};

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

console.log('🔥 COMPLETING MISSING DATA\n');

async function completeMissingData() {
    try {
        // Step 1: Fetch all existing students
        console.log('📥 Step 1: Fetching existing students...');
        const studentsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const students = [];
        studentsSnapshot.forEach(doc => {
            students.push({ id: doc.id, ...doc.data() });
        });
        console.log(`  ✓ Found ${students.length} students\n`);

        // Step 2: Fetch all existing courses
        console.log('📥 Step 2: Fetching existing courses...');
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const courses = [];
        coursesSnapshot.forEach(doc => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        console.log(`  ✓ Found ${courses.length} courses\n`);

        // Step 3: Create enrollments for semester 6
        console.log('🔄 Step 3: Creating enrollments...');
        let enrollmentCount = 0;
        for (const student of students) {
            const studentCourses = courses.filter(c =>
                c.department === student.department && c.semester === 6
            );

            for (const course of studentCourses) {
                const enrollmentId = `${student.id}_${course.id}`;
                await setDoc(doc(db, 'enrollments', enrollmentId), {
                    studentId: student.id,
                    courseId: course.id,
                    semester: 6,
                    status: 'active',
                    enrolledAt: daysAgo(60),
                    createdAt: serverTimestamp()
                });
                enrollmentCount++;
            }
        }
        console.log(`  ✓ Created ${enrollmentCount} enrollments\n`);

        // Step 4: Create historical grades (semesters 3, 4, 5)
        console.log('🔄 Step 4: Creating historical grades...');
        const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6 };
        const grades = ['A+', 'A', 'A', 'B+', 'B+', 'B', 'C'];
        let gradeCount = 0;

        for (const student of students) {
            for (let sem of [3, 4, 5]) {
                const semCourses = courses.filter(c =>
                    c.department === student.department && c.semester === sem
                );

                for (const course of semCourses) {
                    const grade = pickRandom(grades);
                    await setDoc(doc(db, 'grades', `${student.id}_${course.id}`), {
                        studentId: student.id,
                        courseId: course.id,
                        semester: sem,
                        midterm: randomBetween(65, 95),
                        endterm: randomBetween(65, 95),
                        assignments: randomBetween(70, 100),
                        total: randomBetween(70, 95),
                        grade,
                        gradePoints: gradePoints[grade],
                        credits: course.credits,
                        createdAt: daysAgo((6 - sem) * 120),
                        updatedAt: serverTimestamp()
                    });
                    gradeCount++;
                }
            }
        }
        console.log(`  ✓ Created ${gradeCount} historical grades\n`);

        // Step 5: Create attendance for current semester (semester 6)
        console.log('🔄 Step 5: Creating attendance records...');
        let attendanceCount = 0;

        for (const student of students) {
            const semester6Courses = courses.filter(c =>
                c.department === student.department && c.semester === 6
            );

            for (const course of semester6Courses) {
                // Create 30 attendance records over 60 days
                for (let i = 0; i < 30; i++) {
                    const present = Math.random() > 0.15; // 85% attendance avg
                    await setDoc(doc(db, 'attendance', `${student.id}_${course.id}_${i}`), {
                        studentId: student.id,
                        courseId: course.id,
                        date: daysAgo(60 - i * 2),
                        status: present ? 'present' : 'absent',
                        markedBy: 'faculty',
                        createdAt: serverTimestamp()
                    });
                    attendanceCount++;
                }
            }
        }
        console.log(`  ✓ Created ${attendanceCount} attendance records\n`);

        console.log('✅ ALL MISSING DATA COMPLETED!\n');
        console.log('📊 Summary:');
        console.log(`  - Enrollments: ${enrollmentCount}`);
        console.log(`  - Historical Grades: ${gradeCount}`);
        console.log(`  - Attendance Records: ${attendanceCount}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

completeMissingData();
