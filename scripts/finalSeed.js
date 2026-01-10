/**
 * FINAL COMPREHENSIVE SEEDING SCRIPT
 * Implementation: Idempotent (uses setDoc with stable IDs)
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    setDoc,
    doc,
    getDoc,
    serverTimestamp,
    Timestamp,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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

// ========== HELPER FUNCTIONS ==========
const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return Timestamp.fromDate(date);
};

const daysFromNow = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return Timestamp.fromDate(date);
};

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ========== DATA DEFINITIONS ==========

const departments = [
    { code: 'CSE', name: 'Computer Science & Engineering', head: 'Dr. Priya Sharma' },
    { code: 'ECE', name: 'Electronics & Communication Engineering', head: 'Prof. Sandeep Singh' },
    { code: 'EE', name: 'Electrical Engineering', head: 'Dr. Rajesh Kapoor' },
    { code: 'ME', name: 'Mechanical Engineering', head: 'Dr. Amit Kumar' },
    { code: 'CE', name: 'Civil Engineering', head: 'Prof. S.K. Singh' },
];

const facultyByDept = {
    CSE: [
        { name: 'Dr. Priya Sharma', email: 'priya.cse@pec.edu', specialization: 'AI & ML' },
        { name: 'Dr. Mamta Dabra', email: 'mamta.cse@pec.edu', specialization: 'DBMS' }
    ],
    ECE: [
        { name: 'Prof. Sandeep Singh', email: 'sandeep.ece@pec.edu', specialization: 'VLSI' }
    ],
    ME: [
        { name: 'Dr. Amit Kumar', email: 'amit.me@pec.edu', specialization: 'Thermal' }
    ],
    CE: [
        { name: 'Prof. S.K. Singh', email: 'sk.ce@pec.edu', specialization: 'Structural' }
    ],
    EE: [
        { name: 'Dr. Rajesh Kapoor', email: 'rajesh.ee@pec.edu', specialization: 'Power' }
    ]
};

const coursesConfig = {
    CSE: [
        { code: 'CS401', name: 'Algorithms', semester: 4, credits: 4 },
        { code: 'CS403', name: 'Operating Systems', semester: 4, credits: 4 },
        { code: 'CS601', name: 'Machine Learning', semester: 6, credits: 4 }
    ],
    ECE: [
        { code: 'ECE602', name: 'Embedded Systems', semester: 6, credits: 4 }
    ],
    ME: [
        { name: 'Thermal Engineering', code: 'ME301', semester: 6, credits: 4 }
    ]
};

// Students mapping (Legacy + New)
const studentEmails = [
    // Original Seed Students (Standardized)
    { email: 'arjun.patel@pec.edu', name: 'Arjun Patel', dept: 'Computer Science & Engineering', sem: 6, sid: 'PEC20CS001' },
    { email: 'riya.singh@pec.edu', name: 'Riya Singh', dept: 'Computer Science & Engineering', sem: 6, sid: 'PEC20CS045' },
    { email: 'karan.sharma@pec.edu', name: 'Karan Sharma', dept: 'Electronics & Communication Engineering', sem: 6, sid: 'PEC20EC028' },
    { email: 'ananya.gupta@pec.edu', name: 'Ananya Gupta', dept: 'Mechanical Engineering', sem: 6, sid: 'PEC20ME052' },
    { email: 'rohan.verma@pec.edu', name: 'Rohan Verma', dept: 'Computer Science & Engineering', sem: 6, sid: 'PEC20CS089' },
    { email: 'sneha.reddy@pec.edu', name: 'Sneha Reddy', dept: 'Aerospace Engineering', sem: 4, sid: 'PEC21AE015' },
    { email: 'aarav.malhotra@pec.edu', name: 'Aarav Malhotra', dept: 'Civil Engineering', sem: 4, sid: 'PEC21CE033' },
    { email: 'diya.kapoor@pec.edu', name: 'Diya Kapoor', dept: 'Electrical Engineering', sem: 6, sid: 'PEC20EE067' },

    // Comprehensive Seed Students (25-prefix)
    { email: '25111001@pec.edu', name: 'Amit Nair', dept: 'Computer Science & Engineering', sem: 6, sid: '25111001' },
    { email: '25111002@pec.edu', name: 'Ananya Nair', dept: 'Computer Science & Engineering', sem: 6, sid: '25111002' },
    { email: '25111003@pec.edu', name: 'Karan Nair', dept: 'Computer Science & Engineering', sem: 6, sid: '25111003' },
    { email: '25111004@pec.edu', name: 'Karan Patel', dept: 'Computer Science & Engineering', sem: 6, sid: '25111004' },
    { email: '25111005@pec.edu', name: 'Priya Kumar', dept: 'Computer Science & Engineering', sem: 6, sid: '25111005' },

    // Test Students
    { email: 'arjun.student@pec.edu', name: 'Arjun Student', dept: 'Computer Science & Engineering', sem: 4, sid: 'TEST001' },
    { email: 'riya.student@pec.edu', name: 'Riya Student', dept: 'Computer Science & Engineering', sem: 6, sid: 'TEST002' },
    { email: 'karan.student@pec.edu', name: 'Karan Student', dept: 'Electronics & Communication Engineering', sem: 6, sid: 'TEST003' }
];

async function getOrCreateUser(email, password, role, data) {
    let uid;
    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCred.user.uid;
        console.log(`  ✓ Created user: ${email}`);
    } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            uid = userCred.user.uid;
            console.log(`  ⚠ User exists: ${email}`);
        } else {
            throw e;
        }
    }

    await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        role,
        profileComplete: true, // Fix for "Complete your profile" prompt
        status: 'active',
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }, { merge: true });

    return uid;
}

async function main() {
    console.log('🚀 Starting Final Comprehensive Seed...');

    // 1. Create Admin
    const adminId = await getOrCreateUser('admin@pec.edu', 'Admin@123', 'super_admin', {
        fullName: 'System Administrator',
        department: 'Administration'
    });

    // 2. Create Faculty
    const facultyMap = {}; // email -> id
    for (const [deptCode, faculties] of Object.entries(facultyByDept)) {
        const deptName = departments.find(d => d.code === deptCode).name;
        for (const f of faculties) {
            const fid = await getOrCreateUser(f.email, 'Faculty@123', 'faculty', {
                fullName: f.name,
                department: deptName,
                specialization: f.specialization
            });
            facultyMap[f.email] = { id: fid, name: f.name, deptName };
        }
    }

    // 3. Create Students & Profiles
    console.log('\n👥 Creating students and profiles...');
    for (const s of studentEmails) {
        const uid = await getOrCreateUser(s.email, 'Student@123', 'student', {
            fullName: s.name,
            department: s.dept,
            semester: s.sem
        });

        // Create Student Profile
        await setDoc(doc(db, 'studentProfiles', uid), {
            uid: uid,
            enrollmentNumber: s.sid || `PEC25${Math.floor(Math.random() * 1000)}`,
            studentId: s.sid || `PEC25${Math.floor(Math.random() * 1000)}`,
            semester: s.sem,
            department: s.dept,
            batch: s.sem > 4 ? '2020-2024' : '2021-2025',
            section: 'A',
            phone: `+91 ${randomBetween(7000, 9999)}${randomBetween(100000, 999999)}`,
            cgpa: parseFloat((Math.random() * (10 - 7) + 7).toFixed(2)),
            createdAt: serverTimestamp()
        }, { merge: true });
    }

    // Update Faculty Profiles
    console.log('\n👨‍🏫 Creating faculty profiles...');
    for (const [deptCode, faculties] of Object.entries(facultyByDept)) {
        for (const f of faculties) {
            const facultyInfo = facultyMap[f.email];
            await setDoc(doc(db, 'facultyProfiles', facultyInfo.id), {
                uid: facultyInfo.id,
                employeeId: `FAC-${deptCode}-${randomBetween(100, 999)}`,
                specialization: f.specialization,
                yearsOfExperience: randomBetween(5, 25),
                qualification: 'Ph.D.',
                createdAt: serverTimestamp()
            }, { merge: true });
        }
    }

    // 4. Create Departments
    console.log('\n🏢 Creating departments...');
    for (const d of departments) {
        await setDoc(doc(db, 'departments', d.code), {
            ...d,
            createdAt: serverTimestamp()
        }, { merge: true });
    }
    console.log('  ✓ Departments seeded');

    // 5. Create Courses & Faculty Assignments
    const courseMap = {}; // code -> id
    for (const [deptCode, courses] of Object.entries(coursesConfig)) {
        const dept = departments.find(d => d.code === deptCode);
        const faculties = facultyByDept[deptCode];

        for (const c of courses) {
            const faculty = pickRandom(faculties);
            const facultyInfo = facultyMap[faculty.email];
            const courseId = `${c.code}-S${c.semester}`;

            const courseData = {
                ...c,
                department: dept.name,
                facultyId: facultyInfo.id,
                facultyName: facultyInfo.name,
                maxStudents: 60,
                enrolledStudents: 0, // Will update during enrollment
                description: `${c.name} course for ${deptCode} department.`,
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'courses', courseId), courseData, { merge: true });
            courseMap[c.code] = courseId;

            // Faculty Assignment
            const assignmentId = `${facultyInfo.id}_${courseId}`;
            await setDoc(doc(db, 'facultyAssignments', assignmentId), {
                facultyId: facultyInfo.id,
                courseId: courseId,
                semester: c.semester,
                academicYear: '2025-26',
                assignedAt: serverTimestamp()
            }, { merge: true });
        }
    }
    console.log('  ✓ Courses and Faculty Assignments seeded');

    // 6. Dynamic Enrollments for ALL students in DB
    console.log('\n📊 Enrolling ALL students from Database...');
    const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
    let enrollmentCount = 0;

    for (const userDoc of usersSnap.docs) {
        const student = userDoc.data();
        let deptName = student.department;
        let sem = student.semester;

        // Fallback to studentProfiles if data missing in users doc
        if (!deptName || !sem) {
            const profileSnap = await getDoc(doc(db, 'studentProfiles', userDoc.id));
            if (profileSnap.exists()) {
                const profileData = profileSnap.data();
                deptName = deptName || profileData.department;
                sem = sem || profileData.semester;
            }
        }

        if (!deptName || !sem) {
            console.log(`  ⚠ Skipping student ${student.email || userDoc.id}: Missing department or semester`);
            continue;
        }

        // Find courses for this student's dept and semester
        const coursesSnap = await getDocs(query(
            collection(db, 'courses'),
            where('department', '==', deptName),
            where('semester', '==', sem)
        ));

        for (const courseDoc of coursesSnap.docs) {
            const courseId = courseDoc.id;
            const enrollmentId = `${userDoc.id}_${courseId}`;
            await setDoc(doc(db, 'enrollments', enrollmentId), {
                studentId: userDoc.id,
                courseId: courseId,
                semester: sem,
                status: 'active',
                enrolledAt: daysAgo(30)
            }, { merge: true });
            enrollmentCount++;
        }
    }
    console.log(`  ✓ Enrolled all students (${enrollmentCount} total enrollments)`);

    // 7. Timetable
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00'];

    for (const [deptCode, courses] of Object.entries(coursesConfig)) {
        const dept = departments.find(d => d.code === deptCode);
        for (let i = 0; i < courses.length; i++) {
            const c = courses[i];
            const courseId = courseMap[c.code];
            const facultyInfo = facultyMap[facultyByDept[deptCode][0].email];

            const day = days[i % days.length];
            const slot = slots[i % slots.length];
            const ttId = `${courseId}_${day}`;

            await setDoc(doc(db, 'timetable', ttId), {
                day,
                timeSlot: slot,
                courseId,
                courseName: c.name,
                courseCode: c.code,
                facultyId: facultyInfo.id,
                facultyName: facultyInfo.name,
                department: dept.name,
                room: `LH-${randomBetween(100, 500)}`,
                semester: c.semester
            }, { merge: true });
        }
    }
    console.log('  ✓ Timetable seeded');

    // 8. Assignments & Materials
    for (const [code, courseId] of Object.entries(courseMap)) {
        // Assignment
        const assignId = `ASSIGN_${courseId}`;
        await setDoc(doc(db, 'assignments', assignId), {
            courseId,
            title: `Assignment 1: Introduction to ${code}`,
            description: 'Please submit your solutions by Sunday.',
            dueDate: daysFromNow(7),
            totalPoints: 100,
            status: 'active',
            createdAt: serverTimestamp()
        }, { merge: true });

        // Material
        const matId = `MAT_${courseId}`;
        await setDoc(doc(db, 'courseMaterials', matId), {
            courseId,
            title: `${code} Lecture Notes - Week 1`,
            type: 'pdf',
            url: 'https://example.com/notes.pdf',
            uploadedAt: serverTimestamp()
        }, { merge: true });
    }
    console.log('  ✓ Assignments and Materials seeded');

    // 9. Exam Schedules
    for (const [code, courseId] of Object.entries(courseMap)) {
        const examId = `EXAM_${courseId}`;
        await setDoc(doc(db, 'examSchedules', examId), {
            courseId,
            courseCode: code,
            courseName: code, // Fallback
            date: '2025-05-15',
            startTime: '10:00',
            endTime: '13:00',
            room: 'Exam Hall A',
            type: 'Final'
        }, { merge: true });
    }
    console.log('  ✓ Exam Schedules seeded');

    // 10. Attendance Records (Last 30 days)
    console.log('\n📅 Seeding Attendance Records...');
    let attendanceCount = 0;
    for (const userDoc of usersSnap.docs) {
        const studentId = userDoc.id;
        const enrollmentsSnap = await getDocs(query(collection(db, 'enrollments'), where('studentId', '==', studentId)));

        for (const enDoc of enrollmentsSnap.docs) {
            const courseId = enDoc.data().courseId;
            // Create 20 attendance records spread over last 30 days
            for (let i = 0; i < 20; i++) {
                const date = daysAgo(randomBetween(1, 30));
                const status = Math.random() > 0.15 ? 'present' : 'absent';
                const attId = `ATT_${studentId}_${courseId}_${i}`;

                await setDoc(doc(db, 'attendance', attId), {
                    studentId,
                    courseId,
                    date,
                    status,
                    markedBy: 'system_seed',
                    createdAt: serverTimestamp()
                }, { merge: true });
                attendanceCount++;
            }
        }
    }
    console.log(`  ✓ Created ${attendanceCount} attendance records`);

    // 11. Past Academic History (Grades)
    console.log('\n🎓 Seeding Academic History (Grades)...');
    const gradeLetters = ['A+', 'A', 'B+', 'B', 'C'];
    const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 8, 'C': 7 };
    let gradeCount = 0;

    for (const userDoc of usersSnap.docs) {
        const studentId = userDoc.id;
        const student = userDoc.data();
        const currentSem = student.semester || 6;

        // Seed grades for ALL past semesters
        for (let sem = 1; sem < currentSem; sem++) {
            // Mocking 5 courses per semester
            for (let c = 1; c <= 5; c++) {
                const grade = pickRandom(gradeLetters);
                const gId = `GRADE_${studentId}_S${sem}_C${c}`;

                await setDoc(doc(db, 'grades', gId), {
                    studentId,
                    semester: sem,
                    courseName: `Subject ${c} (Semester ${sem})`,
                    courseCode: `SUB${sem}0${c}`,
                    grade,
                    gradePoints: gradePoints[grade],
                    credits: randomBetween(3, 4),
                    totalMarks: randomBetween(70, 95),
                    status: 'published',
                    term: sem % 2 === 0 ? 'Even' : 'Odd',
                    year: 2023 + Math.floor(sem / 2),
                    createdAt: daysAgo(365 * (currentSem - sem) / 2)
                }, { merge: true });
                gradeCount++;
            }
        }
    }
    console.log(`  ✓ Created ${gradeCount} historical grade entries`);

    console.log('\n✅ SEEDING COMPLETE!');
    console.log('Students and Courses are now fully linked.\n');

    process.exit(0);
}

main().catch(err => {
    console.error('❌ SEEDING FAILED:');
    console.error(err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
});
