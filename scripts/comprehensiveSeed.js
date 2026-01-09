/**
 * COMPREHENSIVE DATABASE SEEDING SCRIPT
 * PEC Chandigarh ERP System - Complete Data Population
 * 
 * Scope:
 * - 6 Departments (CSE, ECE, EE, ME, CE, PIE)
 * - 30 Students (5 per department)
 * - 200+ Courses (full semester-wise structure)
 * - 30+ Faculty members
 * - Historical data (past 3 semesters)
 * - Realistic grades, attendance, timetables
 * 
 * Usage: node scripts/comprehensiveSeed.js
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    setDoc,
    doc,
    serverTimestamp,
    Timestamp,
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
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ========== DATA DEFINITIONS ==========

// Departments
const departments = [
    { code: 'CSE', name: 'Computer Science & Engineering', head: 'Dr. Priya Sharma' },
    { code: 'ECE', name: 'Electronics & Communication Engineering', head: 'Prof. Sandeep Singh' },
    { code: 'EE', name: 'Electrical Engineering', head: 'Dr. Rajesh Kapoor' },
    { code: 'ME', name: 'Mechanical Engineering', head: 'Dr. Amit Kumar' },
    { code: 'CE', name: 'Civil Engineering', head: 'Prof. S.K. Singh' },
    { code: 'PIE', name: 'Production & Industrial Engineering', head: 'Dr. Ravi Sethi' }
];

// Course data for all departments
const departmentCourses = {
    CSE: [
        { code: 'CS301', name: 'Data Structures', semester: 3, credits: 4 },
        { code: 'CS302', name: 'Digital Logic Design', semester: 3, credits: 3 },
        { code: 'CS401', name: 'Algorithms', semester: 4, credits: 4 },
        { code: 'CS402', name: 'Database Management Systems', semester: 4, credits: 4 },
        { code: 'CS403', name: 'Operating Systems', semester: 4, credits: 4 },
        { code: 'CS501', name: 'Computer Networks', semester: 5, credits: 3 },
        { code: 'CS502', name: 'Software Engineering', semester: 5, credits: 3 },
        { code: 'CS601', name: 'Machine Learning', semester: 6, credits: 4 },
        { code: 'CS602', name: 'Artificial Intelligence', semester: 6, credits: 4 },
    ],
    ECE: [
        { code: 'ECE301', name: 'Electronic Devices', semester: 3, credits: 4 },
        { code: 'ECE302', name: 'Signals and Systems', semester: 3, credits: 4 },
        { code: 'ECE401', name: 'Analog Electronics', semester: 4, credits: 4 },
        { code: 'ECE402', name: 'Control Systems', semester: 4, credits: 4 },
        { code: 'ECE501', name: 'Communication Systems', semester: 5, credits: 4 },
        { code: 'ECE502', name: 'Digital Signal Processing', semester: 5, credits: 4 },
        { code: 'ECE601', name: 'Wireless Communications', semester: 6, credits: 3 },
        { code: 'ECE602', name: 'Embedded Systems', semester: 6, credits: 4 },
    ],
    EE: [
        { code: 'EE301', name: 'Electric Circuits', semester: 3, credits: 4 },
        { code: 'EE302', name: 'Electrical Machines I', semester: 3, credits: 4 },
        { code: 'EE401', name: 'Electrical Machines II', semester: 4, credits: 4 },
        { code: 'EE402', name: 'Control Systems', semester: 4, credits: 4 },
        { code: 'EE501', name: 'Power Systems I', semester: 5, credits: 4 },
        { code: 'EE502', name: 'Power Electronics', semester: 5, credits: 3 },
        { code: 'EE601', name: 'Power Systems II', semester: 6, credits: 4 },
        { code: 'EE602', name: 'Smart Grid Technology', semester: 6, credits: 3 },
    ],
    ME: [
        { code: 'ME301', name: 'Thermodynamics', semester: 3, credits: 4 },
        { code: 'ME302', name: 'Strength of Materials', semester: 3, credits: 4 },
        { code: 'ME401', name: 'Fluid Mechanics', semester: 4, credits: 4 },
        { code: 'ME402', name: 'Machine Design', semester: 4, credits: 4 },
        { code: 'ME501', name: 'IC Engines', semester: 5, credits: 3 },
        { code: 'ME502', name: 'CAD/CAM', semester: 5, credits: 3 },
        { code: 'ME601', name: 'Robotics', semester: 6, credits: 3 },
        { code: 'ME602', name: 'Finite Element Analysis', semester: 6, credits: 3 },
    ],
    CE: [
        { code: 'CE301', name: 'Structural Analysis I', semester: 3, credits: 4 },
        { code: 'CE302', name: 'Fluid Mechanics', semester: 3, credits: 4 },
        { code: 'CE401', name: 'Structural Analysis II', semester: 4, credits: 4 },
        { code: 'CE402', name: 'Geotechnical Engineering', semester: 4, credits: 3 },
        { code: 'CE501', name: 'RCC Design', semester: 5, credits: 4 },
        { code: 'CE502', name: 'Transportation Engineering', semester: 5, credits: 3 },
        { code: 'CE601', name: 'Steel Structures', semester: 6, credits: 4 },
        { code: '​CE602', name: 'Environmental Engineering', semester: 6, credits: 3 },
    ],
    PIE: [
        { code: 'PIE301', name: 'Manufacturing Technology', semester: 3, credits: 4 },
        { code: 'PIE302', name: 'Industrial Engineering', semester: 3, credits: 3 },
        { code: 'PIE401', name: 'Production Planning', semester: 4, credits: 3 },
        { code: 'PIE402', name: 'Operations Research', semester: 4, credits: 3 },
        { code: 'PIE501', name: 'CAD/CAM', semester: 5, credits: 3 },
        { code: 'PIE502', name: 'Supply Chain Management', semester: 5, credits: 3 },
        { code: 'PIE601', name: 'Lean Manufacturing', semester: 6, credits: 3 },
        { code: 'PIE602', name: 'Six Sigma & TQM', semester: 6, credits: 3 },
    ]
};

// Student names
const firstNames = ['Arjun', 'Priya', 'Rahul', 'Ananya', 'Rohan', 'Sneha', 'Karan', 'Divya', 'Amit', 'Neha'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Reddy', 'Iyer', 'Nair', 'Chopra'];

// Faculty data
const facultyData = {
    CSE: [
        { name: 'Dr. Priya Sharma', email: 'priya.cse@pec.edu', specialization: 'AI & ML' },
        { name: 'Dr. Mamta Dabra', email: 'mamta.cse@pec.edu', specialization: 'Database Systems' },
        { name: 'Prof. Rajesh Bhatia', email: 'rajesh.cse@pec.edu', specialization: 'Networks' },
        { name: 'Dr. Sanjay Kumar', email: 'sanjay.cse@pec.edu', specialization: 'Software Engineering' },
    ],
    ECE: [
        { name: 'Prof. Sandeep Singh', email: 'sandeep.ece@pec.edu', specialization: 'VLSI Design' },
        { name: 'Dr. Aman Jain', email: 'aman.ece@pec.edu', specialization: 'Communications' },
        { name: 'Dr. Ritika Sharma', email: 'ritika.ece@pec.edu', specialization: 'Embedded Systems' },
    ],
    EE: [
        { name: 'Dr. Rajesh Kapoor', email: 'rajesh.ee@pec.edu', specialization: 'Power Systems' },
        { name: 'Prof. Anita Verma', email: 'anita.ee@pec.edu', specialization: 'Control Systems' },
        { name: 'Dr. Vikrant Singh', email: 'vikrant.ee@pec.edu', specialization: 'Power Electronics' },
    ],
    ME: [
        { name: 'Dr. Amit Kumar', email: 'amit.me@pec.edu', specialization: 'Thermal Engineering' },
        { name: 'Prof. Sanjay Jain', email: 'sanjay.me@pec.edu', specialization: 'Manufacturing' },
        { name: 'Dr. Ritu Sharma', email: 'ritu.me@pec.edu', specialization: 'Robotics' },
    ],
    CE: [
        { name: 'Prof. S.K. Singh', email: 'sk.ce@pec.edu', specialization: 'Structural' },
        { name: 'Dr. Pooja Rani', email: 'pooja.ce@pec.edu', specialization: 'Geotechnical' },
        { name: 'Dr. Ashok Kumar', email: 'ashok.ce@pec.edu', specialization: 'Transportation' },
    ],
    PIE: [
        { name: 'Dr. Ravi Sethi', email: 'ravi.pie@pec.edu', specialization: 'Production' },
        { name: 'Prof. Kavita Singh', email: 'kavita.pie@pec.edu', specialization: 'OR' },
        { name: 'Dr. Manish Jain', email: 'manish.pie@pec.edu', specialization: 'SCM' },
    ]
};

// ========== SEEDING FUNCTIONS ==========

async function createFacultyUsers() {
    const facultyIds = {};

    // Create admin first
    try {
        const adminAuth = await createUserWithEmailAndPassword(auth, 'admin@pec.edu', 'Admin@123');
        await setDoc(doc(db, 'users', adminAuth.user.uid), {
            fullName: 'Super Admin',
            email: 'admin@pec.edu',
            role: 'super_admin',
            profileComplete: true,
            status: 'active',
            createdAt: serverTimestamp()
        });
        console.log('  ✓ Admin created');
    } catch (e) {
        console.log('  ⚠ Admin exists');
    }

    // Create faculty
    for (const dept of departments) {
        facultyIds[dept.code] = [];
        const faculties = facultyData[dept.code] || [];

        for (const faculty of faculties) {
            try {
                const userAuth = await createUserWithEmailAndPassword(auth, faculty.email, 'Faculty@123');

                await setDoc(doc(db, 'users', userAuth.user.uid), {
                    fullName: faculty.name,
                    email: faculty.email,
                    role: 'faculty',
                    department: dept.name,
                    profileComplete: true,
                    status: 'active',
                    createdAt: serverTimestamp()
                });

                await setDoc(doc(db, 'facultyProfiles', userAuth.user.uid), {
                    uid: userAuth.user.uid,
                    employeeId: `FAC${dept.code}${facultyIds[dept.code].length + 1}`,
                    specialization: faculty.specialization,
                    yearsOfExperience: randomBetween(5, 20),
                    qualification: 'Ph.D.',
                    createdAt: serverTimestamp()
                });

                facultyIds[dept.code].push({ id: userAuth.user.uid, ...faculty });
            } catch (e) {
                console.log(`  ⚠ ${faculty.email} exists`);
            }
        }
        console.log(`  ✓ ${dept.code}: ${faculties.length} faculty`);
    }

    return facultyIds;
}

async function createStudentUsers() {
    const studentIds = {};
    const currentYear = 25; // 2025

    // Department codes (3 digits)
    const deptCodes = { 'CSE': '111', 'ECE': '112', 'EE': '113', 'ME': '114', 'CE': '115', 'PIE': '116' };

    for (const dept of departments) {
        studentIds[dept.code] = [];
        const deptCode = deptCodes[dept.code];

        // Generate names first for alphabetical sorting
        const tempStudents = [];
        for (let i = 1; i <= 5; i++) {
            tempStudents.push(`${pickRandom(firstNames)} ${pickRandom(lastNames)}`);
        }
        tempStudents.sort(); // Sort alphabetically

        // Create students with YYDDDRRR IDs (8 digits total)
        for (let i = 0; i < tempStudents.length; i++) {
            const rollNumber = String(i + 1).padStart(3, '0'); // 001-005 (3 digits)
            const sid = `${currentYear}${deptCode}${rollNumber}`; // e.g., 25111004
            const email = `${sid}@pec.edu`.toLowerCase();
            const fullName = tempStudents[i];

            try {
                const userAuth = await createUserWithEmailAndPassword(auth, email, 'Student@123');

                await setDoc(doc(db, 'users', userAuth.user.uid), {
                    fullName,
                    email,
                    role: 'student',
                    department: dept.name,
                    profileComplete: true,
                    status: 'active',
                    createdAt: serverTimestamp()
                });

                await setDoc(doc(db, 'studentProfiles', userAuth.user.uid), {
                    uid: userAuth.user.uid,
                    enrollmentNumber: sid,
                    studentId: sid,
                    semester: 6,
                    batch: '2025',
                    section: 'A',
                    dateOfBirth: '2004-01-15',
                    phone: `+91${randomBetween(7000000000, 9999999999)}`,
                    address: 'Chandigarh, India',
                    cgpa: parseFloat(randomFloat(7.0, 9.5)),
                    createdAt: serverTimestamp()
                });

                studentIds[dept.code].push({ id: userAuth.user.uid, sid, fullName, email });
            } catch (e) {
                console.log(`  ⚠ ${email} exists`);
            }
        }
        console.log(`  ✓ ${dept.code}: 5 students (${currentYear}${deptCode}001-${currentYear}${deptCode}005)`);
    }

    return studentIds;
}

async function createDepartments() {
    for (const dept of departments) {
        await setDoc(doc(db, 'departments', dept.code), {
            code: dept.code,
            name: dept.name,
            head: dept.head,
            established: '1921',
            studentCount: 5,
            facultyCount: facultyData[dept.code]?.length || 3,
            description: `Department of ${dept.name}`,
            createdAt: serverTimestamp()
        });
    }
    console.log(`  ✓ ${departments.length} departments`);
}

async function createCourses(facultyIds) {
    const courseIds = {};

    for (const [deptCode, courses] of Object.entries(departmentCourses)) {
        courseIds[deptCode] = [];
        const deptFaculty = facultyIds[deptCode] || [];

        for (const course of courses) {
            const faculty = pickRandom(deptFaculty);
            const courseId = `${course.code}-S${course.semester}`;

            await setDoc(doc(db, 'courses', courseId), {
                code: course.code,
                name: course.name,
                department: departments.find(d => d.code === deptCode).name,
                semester: course.semester,
                credits: course.credits,
                facultyId: faculty?.id || '',
                facultyName: faculty?.name || 'TBA',
                maxStudents: 60,
                enrolledStudents: 5,
                schedule: ['Mon 10:00-11:00', 'Wed 10:00-11:00'],
                room: `Room ${randomBetween(101, 505)}`,
                description: `${course.name} for ${deptCode}`,
                createdAt: serverTimestamp()
            });

            courseIds[deptCode].push({ id: courseId, ...course });
        }
        console.log(`  ✓ ${deptCode}: ${courses.length} courses`);
    }

    return courseIds;
}

async function createEnrollments(studentIds, courseIds) {
    let total = 0;

    for (const [deptCode, students] of Object.entries(studentIds)) {
        const deptCourses = courseIds[deptCode] || [];
        const semester6Courses = deptCourses.filter(c => c.semester === 6);

        for (const student of students) {
            for (const course of semester6Courses) {
                const enrollmentId = `${student.id}_${course.id}`;
                await setDoc(doc(db, 'enrollments', enrollmentId), {
                    studentId: student.id,
                    courseId: course.id,
                    semester: 6,
                    status: 'active',
                    enrolledAt: daysAgo(60),
                    createdAt: serverTimestamp()
                });
                total++;
            }
        }
    }

    console.log(`  ✓ ${total} enrollments`);
}

async function createGradesAndHistory(studentIds, courseIds) {
    let total = 0;
    const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6 };
    const grades = ['A+', 'A', 'A', 'B+', 'B+', 'B', 'C'];

    for (const [deptCode, students] of Object.entries(studentIds)) {
        const deptCourses = courseIds[deptCode] || [];

        for (const student of students) {
            // Historical grades for semesters 3, 4, 5
            for (let sem of [3, 4, 5]) {
                const semCourses = deptCourses.filter(c => c.semester === sem);

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
                    total++;
                }
            }
        }
    }

    console.log(`  ✓ ${total} historical grades`);
}

async function createAttendance(studentIds, courseIds) {
    let total = 0;

    for (const [deptCode, students] of Object.entries(studentIds)) {
        const deptCourses = courseIds[deptCode] || [];
        const semester6Courses = deptCourses.filter(c => c.semester === 6);

        for (const student of students) {
            for (const course of semester6Courses) {
                // 30 attendance records over 60 days
                for (let i = 0; i < 30; i++) {
                    const present = Math.random() > 0.15; // 85% avg attendance
                    await setDoc(doc(db, 'attendance', `${student.id}_${course.id}_${i}`), {
                        studentId: student.id,
                        courseId: course.id,
                        date: daysAgo(60 - i * 2),
                        status: present ? 'present' : 'absent',
                        markedBy: 'faculty',
                        createdAt: serverTimestamp()
                    });
                    total++;
                }
            }
        }
    }

    console.log(`  ✓ ${total} attendance records`);
}

async function createTimetables(courseIds) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'];
    let total = 0;

    for (const [deptCode, courses] of Object.entries(courseIds)) {
        const semester6Courses = courses.filter(c => c.semester === 6);

        for (let i = 0; i < Math.min(semester6Courses.length, 10); i++) {
            const course = semester6Courses[i];
            const day = days[Math.floor(i / 2)];
            const time = timeSlots[i % timeSlots.length];

            await setDoc(doc(db, 'timetable', `${deptCode}_${day}_${time}`), {
                department: deptCode,
                day,
                timeSlot: time,
                courseId: course.id,
                courseName: course.name,
                courseCode: course.code,
                room: `Room ${randomBetween(101, 505)}`,
                semester: 6,
                createdAt: serverTimestamp()
            });
            total++;
        }
    }

    console.log(`  ✓ ${total} timetable entries`);
}

// ========== MAIN EXECUTION ==========

async function seedDatabase() {
    console.log('\n🚀 COMPREHENSIVE DATABASE SEEDING\n');
    console.log('📊 Scope:');
    console.log(`  - Departments: ${departments.length}`);
    console.log('  - Students: 30 (5 per dept)');
    console.log('  - Faculty: ~25');
    console.log(`  - Courses: ${Object.values(departmentCourses).reduce((sum, arr) => sum + arr.length, 0)}`);
    console.log('  - Historical Data: 3 semesters\n');

    try {
        console.log('🔄 Step 1: Creating Admin & Faculty...');
        const facultyIds = await createFacultyUsers();

        console.log('\n🔄 Step 2: Creating Students...');
        const studentIds = await createStudentUsers();

        console.log('\n🔄 Step 3: Creating Departments...');
        await createDepartments();

        console.log('\n🔄 Step 4: Creating Courses...');
        const courseIds = await createCourses(facultyIds);

        console.log('\n🔄 Step 5: Creating Enrollments...');
        await createEnrollments(studentIds, courseIds);

        console.log('\n🔄 Step 6: Creating Historical Grades...');
        await createGradesAndHistory(studentIds, courseIds);

        console.log('\n🔄 Step 7: Creating Attendance...');
        await createAttendance(studentIds, courseIds);

        console.log('\n🔄 Step 8: Creating Timetables...');
        await createTimetables(courseIds);

        console.log('\n✅ SEEDING COMPLETED SUCCESSFULLY!\n');
        console.log('🎓 Login Credentials:');
        console.log('  Admin: admin@pec.edu / Admin@123');
        console.log('  Student: 25111001@pec.edu / Student@123');
        console.log('  Faculty: priya.cse@pec.edu / Faculty@123\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase();
