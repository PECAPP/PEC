/**
 * Firestore Database Seeding Script
 * 
 * This script populates your Firestore database with realistic dummy data
 * for all collections and user roles to demonstrate the complete ERP system.
 * 
 * IMPORTANT: Run this script ONLY ONCE to avoid duplicate data.
 * 
 * Usage:
 * 1. Make sure Firebase is configured in your project
 * 2. Run: node scripts/seedDatabase.js
 * 3. Wait for completion message
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    Timestamp,
    query,
    where,
    getDocs,
    deleteDoc,
    setDoc,
    doc
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';


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
const auth = getAuth(app);

// Helper function to create dates
const daysFromNow = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return Timestamp.fromDate(date);
};

// Dummy User Accounts - PEC Chandigarh
const users = [
    // Super Admin
    {
        email: 'admin@pec.edu',
        password: 'Admin@123',
        data: {
            fullName: 'Dr. Rajesh Kumar Sharma',
            role: 'super_admin',
            department: 'Administration',
            profileComplete: true,
            status: 'active'
        }
    },
    // College Admin
    {
        email: 'registrar@pec.edu',
        password: 'Admin@123',
        data: {
            fullName: 'Prof. Anil Gupta',
            role: 'college_admin',
            department: 'Administration',
            profileComplete: true,
            status: 'active'
        }
    },
    // Faculty Members
    {
        email: 'faculty.cse@pec.edu',
        password: 'Faculty@123',
        data: {
            fullName: 'Dr. Priya Sharma',
            role: 'faculty',
            department: 'Computer Science & Engineering',
            profileComplete: true,
            status: 'active',
            specialization: 'Artificial Intelligence and Machine Learning',
            yearsOfExperience: 14
        }
    },
    {
        email: 'faculty.ece@pec.edu',
        password: 'Faculty@123',
        data: {
            fullName: 'Prof. Sandeep Singh',
            role: 'faculty',
            department: 'Electronics & Communication Engineering',
            profileComplete: true,
            status: 'active',
            specialization: 'VLSI Design and Embedded Systems',
            yearsOfExperience: 18
        }
    },
    {
        email: 'faculty.mech@pec.edu',
        password: 'Faculty@123',
        data: {
            fullName: 'Dr. Amit Kumar',
            role: 'faculty',
            department: 'Mechanical Engineering',
            profileComplete: true,
            status: 'active',
            specialization: 'Thermal Engineering and CFD',
            yearsOfExperience: 12
        }
    },
    {
        email: 'faculty.math@pec.edu',
        password: 'Faculty@123',
        data: {
            fullName: 'Dr. Neha Verma',
            role: 'faculty',
            department: 'Mathematics',
            profileComplete: true,
            status: 'active',
            specialization: 'Numerical Analysis and Optimization',
            yearsOfExperience: 10
        }
    },
    // Placement Officer
    {
        email: 'placement@pec.edu',
        password: 'Placement@123',
        data: {
            fullName: 'Mr. Vikram Malhotra',
            role: 'placement_officer',
            department: 'Training & Placement Cell',
            profileComplete: true,
            status: 'active'
        }
    },
    // Recruiters
    {
        email: 'recruiter.microsoft@pec.edu',
        password: 'Recruiter@123',
        data: {
            fullName: 'Rahul Mehta',
            role: 'recruiter',
            company: 'Microsoft India',
            profileComplete: true,
            status: 'active'
        }
    },
    {
        email: 'recruiter.goldman@pec.edu',
        password: 'Recruiter@123',
        data: {
            fullName: 'Sanjay Kapoor',
            role: 'recruiter',
            company: 'Goldman Sachs',
            profileComplete: true,
            status: 'active'
        }
    },
    {
        email: 'recruiter.adobe@pec.edu',
        password: 'Recruiter@123',
        data: {
            fullName: 'Meera Reddy',
            role: 'recruiter',
            company: 'Adobe India',
            profileComplete: true,
            status: 'active'
        }
    },
    // Students
    {
        email: 'arjunpatel.bt20cse@pec.edu.in',
        password: 'Student@123',
        data: {
            fullName: 'Arjun Patel',
            role: 'student',
            department: 'Computer Science & Engineering',
            semester: 6,
            enrollmentNumber: 'PEC20CS001',
            profileComplete: true,
            status: 'active',
            batch: '2020-2024',
            cgpa: 8.7
        }
    },
    {
        email: 'riyasingh.bt20cse@pec.edu.in',
        password: 'Student@123',
        data: {
            fullName: 'Riya Singh',
            role: 'student',
            department: 'Computer Science & Engineering',
            semester: 6,
            enrollmentNumber: 'PEC20CS045',
            profileComplete: true,
            status: 'active',
            batch: '2020-2024',
            cgpa: 8.3
        }
    },
    {
        email: 'karansharma.bt20ece@pec.edu.in',
        password: 'Student@123',
        data: {
            fullName: 'Karan Sharma',
            role: 'student',
            department: 'Electronics & Communication Engineering',
            semester: 6,
            enrollmentNumber: 'PEC20EC028',
            profileComplete: true,
            status: 'active',
            batch: '2020-2024',
            cgpa: 9.1
        }
    },
    {
        email: 'ananyagupta.bt20me@pec.edu.in',
        password: 'Student@123',
        data: {
            fullName: 'Ananya Gupta',
            role: 'student',
            department: 'Mechanical Engineering',
            semester: 6,
            enrollmentNumber: 'PEC20ME052',
            profileComplete: true,
            status: 'active',
            batch: '2020-2024',
            cgpa: 8.8
        }
    },
    {
        email: 'rohanverma.bt20cse@pec.edu.in',
        password: 'Student@123',
        data: {
            fullName: 'Rohan Verma',
            role: 'student',
            department: 'Computer Science & Engineering',
            semester: 6,
            enrollmentNumber: 'PEC20CS089',
            profileComplete: true,
            status: 'active',
            batch: '2020-2024',
            cgpa: 8.5
        }
    },
    {
        email: 'snehareddy.bt21ae@pec.edu.in',
        password: 'Student@123',
        data: {
            fullName: 'Sneha Reddy',
            role: 'student',
            department: 'Aerospace Engineering',
            semester: 4,
            enrollmentNumber: 'PEC21AE015',
            profileComplete: true,
            status: 'active',
            batch: '2021-2025',
            cgpa: 9.3
        }
    },
    {
        email: 'aaravmalhotra.bt21ce@pec.edu.in',
        password: 'Student@123',
        data: {
            fullName: 'Aarav Malhotra',
            role: 'student',
            department: 'Civil Engineering',
            semester: 4,
            enrollmentNumber: 'PEC21CE033',
            profileComplete: true,
            status: 'active',
            batch: '2021-2025',
            cgpa: 8.1
        }
    },
    {
        email: 'diyakapoor.bt20ee@pec.edu.in',
        password: 'Student@123',
        data: {
            fullName: 'Diya Kapoor',
            role: 'student',
            department: 'Electrical Engineering',
            semester: 6,
            enrollmentNumber: 'PEC20EE067',
            profileComplete: true,
            status: 'active',
            batch: '2020-2024',
            cgpa: 8.6
        }
    }
];

// Departments Data - PEC Chandigarh
const departments = [
    {
        code: 'CSE',
        name: 'Computer Science & Engineering',
        head: 'Dr. Priya Sharma',
        established: '1921',
        studentCount: 420,
        facultyCount: 38,
        description: 'Focus on AI/ML, Data Science, Cybersecurity, and Software Engineering'
    },
    {
        code: 'ECE',
        name: 'Electronics & Communication Engineering',
        head: 'Prof. Sandeep Singh',
        established: '1921',
        studentCount: 380,
        facultyCount: 35,
        description: 'Specializing in VLSI Design, Embedded Systems, and Communication Networks'
    },
    {
        code: 'ME',
        name: 'Mechanical Engineering',
        head: 'Dr. Amit Kumar',
        established: '1921',
        studentCount: 350,
        facultyCount: 32,
        description: 'Focus on Thermal Engineering, Manufacturing, and Robotics'
    },
    {
        code: 'AE',
        name: 'Aerospace Engineering',
        head: 'Dr. T.K. Jindal',
        established: '1968',
        studentCount: 200,
        facultyCount: 22,
        description: 'One of the few institutes in India offering Aerospace Engineering'
    },
    {
        code: 'CE',
        name: 'Civil Engineering',
        head: 'Prof. S.K. Singh',
        established: '1921',
        studentCount: 280,
        facultyCount: 28,
        description: 'Structural, Transportation, and Environmental Engineering'
    },
    {
        code: 'EE',
        name: 'Electrical Engineering',
        head: 'Dr. Rajesh Kapoor',
        established: '1921',
        studentCount: 300,
        facultyCount: 30,
        description: 'Power Systems, Control Systems, and Renewable Energy'
    },
    {
        code: 'MATH',
        name: 'Mathematics',
        head: 'Dr. Neha Verma',
        established: '1921',
        studentCount: 150,
        facultyCount: 18,
        description: 'Mathematics and Computing programs'
    }
];

// Courses Data - PEC Chandigarh
const courses = [
    // CSE Courses
    {
        code: 'CSE301',
        name: 'Data Structures and Algorithms',
        department: 'Computer Science & Engineering',
        semester: 6,
        credits: 4,
        facultyName: 'Dr. Priya Sharma',
        maxStudents: 80,
        enrolledStudents: 72,
        description: 'Advanced DSA with problem-solving techniques',
        schedule: ['Monday 9:00-10:30', 'Wednesday 9:00-10:30']
    },
    {
        code: 'CSE401',
        name: 'Machine Learning',
        department: 'Computer Science & Engineering',
        semester: 6,
        credits: 4,
        facultyName: 'Dr. Priya Sharma',
        maxStudents: 70,
        enrolledStudents: 65,
        description: 'ML algorithms, deep learning fundamentals, and practical applications',
        schedule: ['Tuesday 11:00-12:30', 'Thursday 11:00-12:30']
    },
    {
        code: 'CSE402',
        name: 'Database Management Systems',
        department: 'Computer Science & Engineering',
        semester: 6,
        credits: 3,
        facultyName: 'Dr. Mamta Dabra',
        maxStudents: 80,
        enrolledStudents: 75,
        description: 'Relational databases, SQL, NoSQL, and transaction management',
        schedule: ['Wednesday 14:00-15:30', 'Friday 14:00-15:30']
    },
    // ECE Courses
    {
        code: 'ECE301',
        name: 'VLSI Design',
        department: 'Electronics & Communication Engineering',
        semester: 6,
        credits: 4,
        facultyName: 'Prof. Sandeep Singh',
        maxStudents: 60,
        enrolledStudents: 54,
        description: 'CMOS design, layout techniques, and verification',
        schedule: ['Monday 11:00-12:30', 'Friday 11:00-12:30']
    },
    {
        code: 'ECE302',
        name: 'Embedded Systems',
        department: 'Electronics & Communication Engineering',
        semester: 6,
        credits: 3,
        facultyName: 'Prof. Sandeep Singh',
        maxStudents: 60,
        enrolledStudents: 52,
        description: 'Microcontrollers, ARM architecture, and real-time systems',
        schedule: ['Tuesday 9:00-10:30', 'Thursday 14:00-15:30']
    },
    // ME Courses
    {
        code: 'ME301',
        name: 'Thermal Engineering',
        department: 'Mechanical Engineering',
        semester: 6,
        credits: 4,
        facultyName: 'Dr. Amit Kumar',
        maxStudents: 70,
        enrolledStudents: 63,
        description: 'Heat transfer, thermodynamics, and IC engines',
        schedule: ['Monday 14:00-15:30', 'Wednesday 14:00-15:30']
    },
    // Math Courses
    {
        code: 'MATH201',
        name: 'Advanced Mathematics',
        department: 'Mathematics',
        semester: 4,
        credits: 3,
        facultyName: 'Dr. Neha Verma',
        maxStudents: 100,
        enrolledStudents: 88,
        description: 'Complex analysis, differential equations, and transforms',
        schedule: ['Monday 10:00-11:00', 'Wednesday 10:00-11:00', 'Friday 10:00-11:00']
    },
    // Aerospace Courses
    {
        code: 'AE301',
        name: 'Flight Mechanics',
        department: 'Aerospace Engineering',
        semester: 4,
        credits: 4,
        facultyName: 'Dr. T.K. Jindal',
        maxStudents: 50,
        enrolledStudents: 42,
        description: 'Aircraft performance, stability, and control',
        schedule: ['Tuesday 14:00-15:30', 'Thursday 14:00-15:30']
    }
];

// Helper function to get permissions based on role
const getPermissions = (role) => {
    const basePermissions = {
        canViewDashboard: true,
        canEditProfile: true,
        canAccessCourses: false,
        canAccessFinance: false,
        canAccessPlacements: false,
        canAccessReports: false,
        canAccessAdmin: false,
        canManageCourses: false,
        canManageUsers: false,
        canManageFinance: false,
        canManagePlacements: false,
        canManageRecuiters: false,
        canManageInstitution: false
    };

    switch (role) {
        case 'super_admin':
        case 'college_admin':
            return {
                ...basePermissions,
                canAccessCourses: true,
                canAccessFinance: true,
                canAccessPlacements: true,
                canAccessReports: true,
                canAccessAdmin: true,
                canManageCourses: true,
                canManageUsers: true,
                canManageFinance: true,
                canManagePlacements: true,
                canManageRecuiters: true,
                canManageInstitution: true
            };
        case 'faculty':
            return {
                ...basePermissions,
                canAccessCourses: true,
                canManageCourses: true,
                canAccessReports: true
            };
        case 'placement_officer':
            return {
                ...basePermissions,
                canAccessPlacements: true,
                canManagePlacements: true,
                canAccessReports: true
            };
        case 'recruiter':
            return {
                ...basePermissions,
                canAccessPlacements: true
            };
        case 'student':
            return {
                ...basePermissions,
                canAccessCourses: true,
                canAccessFinance: true,
                canAccessPlacements: true
            };
        default:
            return basePermissions;
    }
};

// Helper function to delete all documents in a collection
const deleteCollection = async (collectionName) => {
    try {
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);

        const deletePromises = [];
        querySnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });

        await Promise.all(deletePromises);
        console.log(`  ✓ Cleared ${collectionName} (${querySnapshot.size} documents)`);
    } catch (error) {
        console.log(`  ⚠ ${collectionName} collection doesn't exist or is empty`);
    }
};

// Seed Database Function
async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Step 0: Clean up existing data (including user documents)
        console.log('🗑️  Cleaning up existing data...');
        const collectionsToClean = [
            'users',
            'departments',
            'courses',
            'enrollments',
            'timetableSlots',
            'attendance',
            'grades',
            'examSchedules',
            'assignments',
            'submissions',
            'courseMaterials',
            'jobs',
            'applications',
            'feeRecords'
        ];

        for (const coll of collectionsToClean) {
            await deleteCollection(coll);
        }
        console.log('✅ Cleanup complete!\n');

        // Step 1: Create User Accounts
        console.log('👥 Creating user accounts...');
        const userIds = {};

        for (const user of users) {
            try {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    user.email,
                    user.password
                );
                const uid = userCredential.user.uid;
                userIds[user.email] = uid;

                // Add user data to Firestore with all required fields
                // Use setDoc with UID as document ID (not auto-generated ID)
                await setDoc(doc(db, 'users', uid), {
                    uid: uid,
                    email: user.email,
                    ...user.data,
                    permissions: getPermissions(user.data.role),
                    verified: false,
                    avatar: null,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                console.log(`  ✓ Created: ${user.data.fullName} (${user.data.role})`);
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log(`  ⚠ Skipped: ${user.email} (already exists)`);

                    // User exists in Auth but we deleted Firestore doc - recreate it
                    try {
                        // Sign in to get the UID
                        const { signInWithEmailAndPassword } = await import('firebase/auth');
                        const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
                        const uid = userCredential.user.uid;
                        userIds[user.email] = uid;

                        // Create/update Firestore document with UID as document ID
                        await setDoc(doc(db, 'users', uid), {
                            uid: uid,
                            email: user.email,
                            ...user.data,
                            permissions: getPermissions(user.data.role),
                            verified: false,
                            avatar: null,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        });

                        console.log(`  ✓ Recreated Firestore doc for: ${user.email}`);
                    } catch (firestoreError) {
                        console.error(`  ✗ Error recreating doc for ${user.email}:`, firestoreError.message);
                    }
                } else {
                    console.error(`  ✗ Error creating ${user.email}:`, error.message);
                }
            }
        }

        // Step 2: Create Departments
        console.log('\n🏢 Creating departments...');
        for (const dept of departments) {
            await addDoc(collection(db, 'departments'), {
                ...dept,
                createdAt: serverTimestamp()
            });
            console.log(`  ✓ ${dept.name}`);
        }

        // Step 3: Create Courses
        console.log('\n📚 Creating courses...');
        const courseIds = {};
        for (const course of courses) {
            const docRef = await addDoc(collection(db, 'courses'), {
                ...course,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            courseIds[course.code] = docRef.id;
            console.log(`  ✓ ${course.code} - ${course.name}`);
        }

        // Step 4: Create Enrollments (Students to Courses)
        console.log('\n📝 Creating enrollments...');
        const studentEmails = users.filter(u => u.data.role === 'student').map(u => u.email);

        // Enroll CSE students in CSE courses
        for (const email of ['arjunpatel.bt20cse@pec.edu.in', 'riyasingh.bt20cse@pec.edu.in', 'rohanverma.bt20cse@pec.edu.in']) {
            const uid = userIds[email];
            if (uid) {
                for (const courseCode of ['CSE301', 'CSE401']) {
                    await addDoc(collection(db, 'enrollments'), {
                        studentId: uid,
                        courseId: courseIds[courseCode],
                        courseCode: courseCode,
                        status: 'active',
                        enrolledAt: serverTimestamp()
                    });
                }
                console.log(`  ✓ Enrolled ${email.split('@')[0]} in CSE courses`);
            }
        }

        // Enroll ECE student in ECE courses
        const eceStudentUid = userIds['karansharma.bt20ece@pec.edu.in'];
        if (eceStudentUid) {
            for (const courseCode of ['ECE301', 'ECE302']) {
                await addDoc(collection(db, 'enrollments'), {
                    studentId: eceStudentUid,
                    courseId: courseIds[courseCode],
                    courseCode: courseCode,
                    status: 'active',
                    enrolledAt: serverTimestamp()
                });
            }
            console.log(`  ✓ Enrolled student3 in ECE courses`);
        }

        // Enroll ME student in ME courses
        const meStudentUid = userIds['ananyagupta.bt20me@pec.edu.in'];
        if (meStudentUid) {
            await addDoc(collection(db, 'enrollments'), {
                studentId: meStudentUid,
                courseId: courseIds['ME301'],
                courseCode: 'ME301',
                status: 'active',
                enrolledAt: serverTimestamp()
            });
            console.log(`  ✓ Enrolled student4 in ME courses`);
        }

        // Step 5: Create Timetable Slots
        console.log('\n📅 Creating timetable slots...');
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const timeSlots = [
            '9:00-10:30',
            '11:00-12:30',
            '13:00-14:30',
            '14:00-15:30'
        ];

        const timetableData = [
            { day: 'Monday', timeSlot: '9:00-10:30', courseCode: 'CSE301', room: 'LH-101' },
            { day: 'Wednesday', timeSlot: '9:00-10:30', courseCode: 'CSE301', room: 'LH-101' },
            { day: 'Tuesday', timeSlot: '11:00-12:30', courseCode: 'CSE401', room: 'LH-102' },
            { day: 'Thursday', timeSlot: '11:00-12:30', courseCode: 'CSE401', room: 'LH-102' },
            { day: 'Wednesday', timeSlot: '14:00-15:30', courseCode: 'CSE402', room: 'LH-103' },
            { day: 'Friday', timeSlot: '14:00-15:30', courseCode: 'CSE402', room: 'LH-103' },
            { day: 'Monday', timeSlot: '11:00-12:30', courseCode: 'ECE301', room: 'ECE-Lab1' },
            { day: 'Friday', timeSlot: '11:00-12:30', courseCode: 'ECE301', room: 'ECE-Lab1' },
            { day: 'Monday', timeSlot: '14:00-15:30', courseCode: 'ME301', room: 'ME-Lab' },
            { day: 'Wednesday', timeSlot: '14:00-15:30', courseCode: 'ME301', room: 'ME-Lab' }
        ];

        for (const slot of timetableData) {
            await addDoc(collection(db, 'timetableSlots'), {
                ...slot,
                courseId: courseIds[slot.courseCode],
                createdAt: serverTimestamp()
            });
        }
        console.log(`  ✓ Created ${timetableData.length} timetable slots`);

        // Step 6: Create Attendance Records
        console.log('\n✓ Creating attendance records...');
        const cseStudents = ['arjunpatel.bt20cse@pec.edu.in', 'riyasingh.bt20cse@pec.edu.in', 'rohanverma.bt20cse@pec.edu.in'];
        for (const email of cseStudents) {
            const uid = userIds[email];
            if (uid) {
                // Create attendance for past 15 days for CSE301
                for (let i = 1; i <= 15; i++) {
                    await addDoc(collection(db, 'attendance'), {
                        studentId: uid,
                        courseId: courseIds['CSE301'],
                        courseCode: 'CSE301',
                        date: daysFromNow(-i),
                        status: Math.random() > 0.15 ? 'present' : 'absent',
                        markedBy: userIds['faculty.cse@pec.edu'],
                        markedAt: serverTimestamp()
                    });
                }
            }
        }
        console.log(`  ✓ Created attendance records for CSE301`);

        // Step 7: Create Grades
        console.log('\n🎓 Creating grades...');
        for (const email of cseStudents) {
            const uid = userIds[email];
            if (uid) {
                await addDoc(collection(db, 'grades'), {
                    studentId: uid,
                    courseId: courseIds['CSE301'],
                    courseCode: 'CSE301',
                    semester: 6,
                    midterm: Math.floor(Math.random() * 20) + 30,
                    final: Math.floor(Math.random() * 30) + 50,
                    total: Math.floor(Math.random() * 20) + 75,
                    grade: 'A',
                    credits: 4,
                    gradePoints: 8.5,
                    enteredBy: userIds['faculty.cse@pec.edu'],
                    enteredAt: serverTimestamp()
                });
            }
        }
        console.log(`  ✓ Created grades for CSE301`);

        // Step 8: Create Exam Schedules
        console.log('\n📋 Creating exam schedules...');
        const examSchedules = [
            {
                courseId: courseIds['CSE301'],
                courseCode: 'CSE301',
                courseName: 'Data Structures and Algorithms',
                date: daysFromNow(15),
                startTime: '09:00',
                endTime: '12:00',
                room: 'Main Auditorium',
                type: 'Final Exam'
            },
            {
                courseId: courseIds['CSE401'],
                courseCode: 'CSE401',
                courseName: 'Machine Learning',
                date: daysFromNow(18),
                startTime: '14:00',
                endTime: '17:00',
                room: 'CSE Block - Hall 1',
                type: 'Final Exam'
            },
            {
                courseId: courseIds['ECE301'],
                courseCode: 'ECE301',
                courseName: 'VLSI Design',
                date: daysFromNow(12),
                startTime: '09:00',
                endTime: '12:00',
                room: 'ECE Block - Hall 2',
                type: 'Midterm Exam'
            },
            {
                courseId: courseIds['ME301'],
                courseCode: 'ME301',
                courseName: 'Thermal Engineering',
                date: daysFromNow(20),
                startTime: '14:00',
                endTime: '17:00',
                room: 'ME Block - Hall 1',
                type: 'Final Exam'
            }
        ];

        for (const exam of examSchedules) {
            await addDoc(collection(db, 'examSchedules'), {
                ...exam,
                createdAt: serverTimestamp()
            });
        }
        console.log(`  ✓ Created ${examSchedules.length} exam schedules`);

        // Step 9: Create Assignments
        console.log('\n📝 Creating assignments...');
        const assignments = [
            {
                courseId: courseIds['CSE301'],
                courseCode: 'CSE301',
                courseName: 'Data Structures and Algorithms',
                title: 'Implement Binary Search Tree Operations',
                description: 'Write a complete BST implementation with insert, delete, search, and traversal operations. Include proper documentation and test cases.',
                dueDate: daysFromNow(7),
                maxMarks: 100,
                createdBy: userIds['faculty.cse@pec.edu']
            },
            {
                courseId: courseIds['CSE401'],
                courseCode: 'CSE401',
                courseName: 'Machine Learning',
                title: 'Classification Model - Iris Dataset',
                description: 'Build and train a classification model on the Iris dataset. Compare performance of at least 3 different algorithms.',
                dueDate: daysFromNow(10),
                maxMarks: 100,
                createdBy: userIds['faculty.cse@pec.edu']
            },
            {
                courseId: courseIds['CSE402'],
                courseCode: 'CSE402',
                courseName: 'Database Management Systems',
                title: 'Library Management System Database',
                description: 'Design a normalized database schema for a library management system. Include ER diagram, schema, and sample queries.',
                dueDate: daysFromNow(12),
                maxMarks: 100,
                createdBy: userIds['faculty.cse@pec.edu']
            },
            {
                courseId: courseIds['ECE301'],
                courseCode: 'ECE301',
                courseName: 'VLSI Design',
                title: 'CMOS Inverter Design',
                description: 'Design and simulate a CMOS inverter circuit. Analyze voltage transfer characteristics and power consumption.',
                dueDate: daysFromNow(8),
                maxMarks: 50,
                createdBy: userIds['faculty.ece@pec.edu']
            }
        ];

        const assignmentIds = {};
        for (const assignment of assignments) {
            const docRef = await addDoc(collection(db, 'assignments'), {
                ...assignment,
                createdAt: serverTimestamp()
            });
            assignmentIds[assignment.title] = docRef.id;
        }
        console.log(`  ✓ Created ${assignments.length} assignments`);

        // Step 10: Create Submissions
        console.log('\n📤 Creating assignment submissions...');
        const student1Uid = userIds['arjunpatel.bt20cse@pec.edu.in'];
        if (student1Uid) {
            await addDoc(collection(db, 'submissions'), {
                assignmentId: assignmentIds['Implement Binary Search Tree Operations'],
                studentId: student1Uid,
                fileUrl: 'https://drive.google.com/file/d/pec-sample-bst-implementation',
                submittedAt: daysFromNow(-2),
                marksObtained: 88,
                feedback: 'Excellent implementation. Well-structured code with good edge case handling.',
                gradedBy: userIds['faculty.cse@pec.edu']
            });
            console.log(`  ✓ Created submission for student1`);
        }

        // Step 11: Create Course Materials
        console.log('\n📚 Creating course materials...');
        const materials = [
            {
                courseId: courseIds['CSE301'],
                courseCode: 'CSE301',
                courseName: 'Data Structures and Algorithms',
                title: 'Lecture Notes: Trees and Graphs',
                description: 'Comprehensive notes on tree and graph data structures, traversal algorithms',
                fileURL: 'https://drive.google.com/file/d/pec-dsa-trees-graphs',
                type: 'lecture-notes',
                uploadedBy: userIds['faculty.cse@pec.edu']
            },
            {
                courseId: courseIds['CSE401'],
                courseCode: 'CSE401',
                courseName: 'Machine Learning',
                title: 'Video Lecture: Neural Networks Basics',
                description: 'Introduction to neural networks, activation functions, and backpropagation',
                fileURL: 'https://youtube.com/watch?v=pec-ml-nn-basics',
                type: 'video',
                uploadedBy: userIds['faculty.cse@pec.edu']
            },
            {
                courseId: courseIds['CSE402'],
                courseCode: 'CSE402',
                courseName: 'Database Management Systems',
                title: 'SQL Query Reference Guide',
                description: 'Complete reference for SQL DDL, DML, and DCL commands with examples',
                fileURL: 'https://drive.google.com/file/d/pec-sql-reference',
                type: 'reference',
                uploadedBy: userIds['faculty.cse@pec.edu']
            },
            {
                courseId: courseIds['ECE301'],
                courseCode: 'ECE301',
                courseName: 'VLSI Design',
                title: 'CMOS Design Methodology',
                description: 'Design flow, layout techniques, and verification procedures',
                fileURL: 'https://drive.google.com/file/d/pec-vlsi-cmos-design',
                type: 'lecture-notes',
                uploadedBy: userIds['faculty.ece@pec.edu']
            },
            {
                courseId: courseIds['ME301'],
                courseCode: 'ME301',
                courseName: 'Thermal Engineering',
                title: 'Heat Transfer Tutorial Videos',
                description: 'Video series on conduction, convection, and radiation',
                fileURL: 'https://youtube.com/playlist?list=pec-thermal-heat-transfer',
                type: 'video',
                uploadedBy: userIds['faculty.mech@pec.edu']
            }
        ];

        for (const material of materials) {
            await addDoc(collection(db, 'courseMaterials'), {
                ...material,
                uploadedAt: serverTimestamp()
            });
        }
        console.log(`  ✓ Created ${materials.length} course materials`);

        // Step 12: Create Job Postings - PEC Chandigarh Recruiters
        console.log('\n💼 Creating job postings...');
        const jobs = [
            {
                title: 'Software Development Engineer',
                company: 'Microsoft India',
                description: 'Join Microsoft India to work on cloud solutions and enterprise applications. Great opportunity for PEC graduates.',
                requirements: ['Strong C++ and DSA skills', 'Experience with distributed systems', 'B.Tech in CSE/ECE'],
                location: 'Hyderabad, India',
                type: 'full-time',
                salary: '₹28-42 LPA',
                deadline: daysFromNow(30),
                tags: ['C++', 'Azure', 'Distributed Systems', 'Cloud'],
                postedBy: userIds['recruiter.microsoft@pec.edu'],
                status: 'open'
            },
            {
                title: 'Analyst - Technology Division',
                company: 'Goldman Sachs',
                description: 'Work on high-performance trading systems and financial technology at Goldman Sachs Bangalore.',
                requirements: ['Strong programming skills', 'Problem solving abilities', 'B.Tech/M.Tech from premier institutions'],
                location: 'Bangalore, India',
                type: 'full-time',
                salary: '₹42-61 LPA',
                deadline: daysFromNow(35),
                tags: ['Java', 'C++', 'Finance', 'Algorithms'],
                postedBy: userIds['recruiter.goldman@pec.edu'],
                status: 'open'
            },
            {
                title: 'Software Engineer - Creative Cloud',
                company: 'Adobe India',
                description: 'Build next-generation creative tools used by millions of professionals worldwide.',
                requirements: ['Strong C++/JavaScript', 'UI/UX understanding', 'B.Tech CSE preferred'],
                location: 'Noida, India',
                type: 'full-time',
                salary: '₹18-28 LPA',
                deadline: daysFromNow(25),
                tags: ['JavaScript', 'React', 'C++', 'UI/UX'],
                postedBy: userIds['recruiter.adobe@pec.edu'],
                status: 'open'
            },
            {
                title: 'SDE Intern - Summer 2025',
                company: 'Microsoft India',
                description: 'Summer internship program for pre-final year students in CSE/ECE. Work on real Microsoft products.',
                requirements: ['Currently in 3rd year B.Tech', 'Strong DSA foundation', 'Good academics (CGPA >= 8.0'],
                location: 'Bangalore/Hyderabad, India',
                type: 'internship',
                salary: '₹95K/month + PPO opportunity',
                deadline: daysFromNow(20),
                tags: ['Python', 'DSA', 'Internship', 'PPO'],
                postedBy: userIds['recruiter.microsoft@pec.edu'],
                status: 'open'
            },
            {
                title: 'ML Engineer',
                company: 'Adobe India',
                description: 'Work on AI-powered features for Adobe Creative Cloud products.',
                requirements: ['ML/DL fundamentals', 'Python proficiency', 'Experience with PyTorch/TensorFlow'],
                location: 'Bangalore, India',
                type: 'full-time',
                salary: '₹22-32 LPA',
                deadline: daysFromNow(28),
                tags: ['Python', 'TensorFlow', 'ML', 'Computer Vision'],
                postedBy: userIds['recruiter.adobe@pec.edu'],
                status: 'open'
            }
        ];

        const jobIds = {};
        for (const job of jobs) {
            const docRef = await addDoc(collection(db, 'jobs'), {
                ...job,
                postedAt: serverTimestamp()
            });
            jobIds[job.title] = docRef.id;
        }
        console.log(`  ✓ Created ${jobs.length} job postings`);

        // Step 13: Create Job Applications
        console.log('\n📨 Creating job applications...');
        const applications = [
            {
                jobId: jobIds['Software Development Engineer'],
                studentId: student1Uid,
                resume: 'https://drive.google.com/file/d/pec-arjun-resume',
                coverLetter: 'I am excited to apply for the Software Development Engineer position at Microsoft India. My strong foundation in DSA and distributed systems makes me a great fit.',
                status: 'shortlisted',
                appliedAt: daysFromNow(-5)
            },
            {
                jobId: jobIds['SDE Intern - Summer 2025'],
                studentId: userIds['riyasingh.bt20cse@pec.edu.in'],
                resume: 'https://drive.google.com/file/d/pec-riya-resume',
                coverLetter: 'I am passionate about software development and would love to intern at Microsoft. My CGPA of 8.3 and strong DSA foundation align well with the requirements.',
                status: 'pending',
                appliedAt: daysFromNow(-3)
            },
            {
                jobId: jobIds['ML Engineer'],
                studentId: userIds['rohanverma.bt20cse@pec.edu.in'],
                resume: 'https://drive.google.com/file/d/pec-rohan-resume',
                coverLetter: 'My experience with ML/DL and Python makes me a strong candidate for the ML Engineer role at Adobe India.',
                status: 'pending',
                appliedAt: daysFromNow(-1)
            }
        ];

        for (const app of applications) {
            await addDoc(collection(db, 'applications'), app);
        }
        console.log(`  ✓ Created ${applications.length} job applications`);

        // Step 14: Create Fee Records
        console.log('\n💳 Creating fee records...');
        for (const email of cseStudents) {
            const uid = userIds[email];
            if (uid) {
                await addDoc(collection(db, 'feeRecords'), {
                    studentId: uid,
                    amount: 125000,
                    category: 'tuition',
                    description: 'Semester Fee - Monsoon 2024',
                    dueDate: daysFromNow(15),
                    status: Math.random() > 0.5 ? 'paid' : 'pending',
                    createdAt: serverTimestamp()
                });
            }
        }
        console.log(`  ✓ Created fee records for students`);

        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📋 Summary:');
        console.log(`   • Users: ${users.length}`);
        console.log(`   • Departments: ${departments.length}`);
        console.log(`   • Courses: ${courses.length}`);
        console.log(`   • Enrollments: Multiple students across CSE, ECE, ME`);
        console.log(`   • Timetable Slots: ${timetableData.length}`);
        console.log(`   • Attendance Records: 15 days for CSE students`);
        console.log(`   • Exam Schedules: ${examSchedules.length}`);
        console.log(`   • Assignments: ${assignments.length}`);
        console.log(`   • Course Materials: ${materials.length}`);
        console.log(`   • Job Postings: ${jobs.length}`);
        console.log(`   • Applications: ${applications.length}\n`);
        console.log('🎉 You can now log in with any of the following accounts:\n');
        console.log('   Super Admin: admin@pec.edu / Admin@123');
        console.log('   College Admin: registrar@pec.edu / Admin@123');
        console.log('   Faculty (CSE): faculty.cse@pec.edu / Faculty@123');
        console.log('   Faculty (ECE): faculty.ece@pec.edu / Faculty@123');
        console.log('   Faculty (Mech): faculty.mech@pec.edu / Faculty@123');
        console.log('   Placement Officer: placement@pec.edu / Placement@123');
        console.log('   Recruiter (Microsoft): recruiter.microsoft@pec.edu / Recruiter@123');
        console.log('   Recruiter (Goldman): recruiter.goldman@pec.edu / Recruiter@123');
        console.log('   Student 1 (CSE): arjunpatel.bt20cse@pec.edu.in / Student@123');
        console.log('   Student 2 (CSE): riyasingh.bt20cse@pec.edu.in / Student@123');
        console.log('   Student 3 (ECE): karansharma.bt20ece@pec.edu.in / Student@123');
        console.log('   Student 4 (ME): ananyagupta.bt20me@pec.edu.in / Student@123\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

// Run the seeder
seedDatabase().then(() => {
    console.log('🏁 Seeding process finished.');
    process.exit(0);
}).catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
