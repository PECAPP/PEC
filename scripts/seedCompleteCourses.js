/**
 * COMPREHENSIVE COURSE SEEDING SCRIPT
 * Creates 4 courses per department with:
 * - Complete course details
 * - Faculty assignments
 * - Student enrollments
 * - Assignments with submissions
 * - Attendance records
 * - Grades
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp,
    doc,
    setDoc,
    updateDoc
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

// Department courses mapping (4 courses per department)
const departmentCourses = {
    'Computer Science & Engineering': [
        {
            code: 'CS301',
            name: 'Data Structures and Algorithms',
            credits: 4,
            semester: 3,
            description: 'Advanced data structures including trees, graphs, hashing, and dynamic programming algorithms.',
            syllabus: ['Arrays & Linked Lists', 'Stacks & Queues', 'Trees & BST', 'Graphs & DFS/BFS', 'Dynamic Programming', 'Hashing'],
            maxStudents: 60
        },
        {
            code: 'CS302',
            name: 'Database Management Systems',
            credits: 3,
            semester: 3,
            description: 'Relational databases, SQL, normalization, transactions, and database design principles.',
            syllabus: ['ER Modeling', 'Relational Algebra', 'SQL Queries', 'Normalization', 'Transactions & ACID', 'Indexing'],
            maxStudents: 60
        },
        {
            code: 'CS401',
            name: 'Operating Systems',
            credits: 4,
            semester: 4,
            description: 'Process management, memory management, file systems, and concurrent programming.',
            syllabus: ['Process Scheduling', 'Deadlocks', 'Memory Management', 'Virtual Memory', 'File Systems', 'Synchronization'],
            maxStudents: 60
        },
        {
            code: 'CS501',
            name: 'Machine Learning',
            credits: 3,
            semester: 5,
            description: 'Supervised and unsupervised learning, neural networks, and practical ML applications.',
            syllabus: ['Linear Regression', 'Classification', 'Decision Trees', 'Neural Networks', 'Clustering', 'Dimensionality Reduction'],
            maxStudents: 50
        }
    ],
    'Electronics & Communication Engineering': [
        {
            code: 'EC301',
            name: 'Analog Electronics',
            credits: 4,
            semester: 3,
            description: 'Transistor circuits, amplifiers, oscillators, and analog signal processing.',
            syllabus: ['BJT Amplifiers', 'FET Circuits', 'Operational Amplifiers', 'Oscillators', 'Power Amplifiers', 'Filters'],
            maxStudents: 60
        },
        {
            code: 'EC302',
            name: 'Digital Signal Processing',
            credits: 3,
            semester: 3,
            description: 'Discrete-time signals, Z-transforms, digital filters, and FFT algorithms.',
            syllabus: ['DT Signals', 'Z-Transform', 'DFT & FFT', 'IIR Filters', 'FIR Filters', 'Applications'],
            maxStudents: 60
        },
        {
            code: 'EC401',
            name: 'VLSI Design',
            credits: 4,
            semester: 4,
            description: 'CMOS circuits, logic design, layout techniques, and chip fabrication.',
            syllabus: ['CMOS Fundamentals', 'Logic Gates', 'Sequential Circuits', 'Layout Design', 'Timing Analysis', 'Testing'],
            maxStudents: 50
        },
        {
            code: 'EC501',
            name: 'Wireless Communication',
            credits: 3,
            semester: 5,
            description: 'Wireless channels, modulation techniques, multiple access, and mobile networks.',
            syllabus: ['Propagation Models', 'Modulation', 'MIMO Systems', 'OFDM', '4G/5G Networks', 'IoT'],
            maxStudents: 50
        }
    ],
    'Mechanical Engineering': [
        {
            code: 'ME301',
            name: 'Thermodynamics',
            credits: 4,
            semester: 3,
            description: 'Laws of thermodynamics, heat engines, refrigeration cycles, and entropy.',
            syllabus: ['First Law', 'Second Law', 'Carnot Cycle', 'Entropy', 'Refrigeration', 'Gas Power Cycles'],
            maxStudents: 60
        },
        {
            code: 'ME302',
            name: 'Fluid Mechanics',
            credits: 3,
            semester: 3,
            description: 'Fluid properties, flow dynamics, Bernoulli equation, and viscous flow.',
            syllabus: ['Fluid Properties', 'Fluid Statics', 'Bernoulli Equation', 'Viscous Flow', 'Boundary Layer', 'Turbulence'],
            maxStudents: 60
        },
        {
            code: 'ME401',
            name: 'Machine Design',
            credits: 4,
            semester: 4,
            description: 'Design of machine elements, stress analysis, and failure theories.',
            syllabus: ['Design Process', 'Stress Analysis', 'Shafts & Keys', 'Bearings', 'Gears', 'Springs'],
            maxStudents: 60
        },
        {
            code: 'ME501',
            name: 'Manufacturing Processes',
            credits: 3,
            semester: 5,
            description: 'Casting, forming, machining, welding, and modern manufacturing techniques.',
            syllabus: ['Casting', 'Forming', 'Machining', 'Welding', 'CNC', 'Additive Manufacturing'],
            maxStudents: 50
        }
    ],
    'Electrical Engineering': [
        {
            code: 'EE301',
            name: 'Electrical Machines',
            credits: 4,
            semester: 3,
            description: 'DC machines, transformers, induction motors, and synchronous machines.',
            syllabus: ['DC Motors', 'Transformers', 'Induction Motors', 'Synchronous Machines', 'Motor Control', 'Testing'],
            maxStudents: 60
        },
        {
            code: 'EE302',
            name: 'Power Systems',
            credits: 3,
            semester: 3,
            description: 'Power generation, transmission, distribution, and grid management.',
            syllabus: ['Generation', 'Transmission Lines', 'Distribution', 'Load Flow', 'Fault Analysis', 'Protection'],
            maxStudents: 60
        },
        {
            code: 'EE401',
            name: 'Control Systems',
            credits: 4,
            semester: 4,
            description: 'System modeling, stability analysis, PID controllers, and state-space methods.',
            syllabus: ['Transfer Functions', 'Stability', 'Root Locus', 'Frequency Response', 'PID Control', 'State Space'],
            maxStudents: 60
        },
        {
            code: 'EE501',
            name: 'Renewable Energy Systems',
            credits: 3,
            semester: 5,
            description: 'Solar, wind, hydro energy systems, and grid integration.',
            syllabus: ['Solar PV', 'Wind Turbines', 'Hydro Power', 'Energy Storage', 'Grid Integration', 'Smart Grids'],
            maxStudents: 50
        }
    ],
    'Civil Engineering': [
        {
            code: 'CE301',
            name: 'Structural Analysis',
            credits: 4,
            semester: 3,
            description: 'Analysis of beams, frames, trusses, and structural stability.',
            syllabus: ['Beams', 'Frames', 'Trusses', 'Deflections', 'Influence Lines', 'Matrix Methods'],
            maxStudents: 60
        },
        {
            code: 'CE302',
            name: 'Geotechnical Engineering',
            credits: 3,
            semester: 3,
            description: 'Soil mechanics, foundation design, and slope stability.',
            syllabus: ['Soil Properties', 'Compaction', 'Shear Strength', 'Consolidation', 'Foundation Design', 'Slope Stability'],
            maxStudents: 60
        },
        {
            code: 'CE401',
            name: 'Transportation Engineering',
            credits: 4,
            semester: 4,
            description: 'Highway design, traffic engineering, and transportation planning.',
            syllabus: ['Highway Alignment', 'Pavement Design', 'Traffic Flow', 'Intersections', 'Transportation Planning', 'Safety'],
            maxStudents: 60
        },
        {
            code: 'CE501',
            name: 'Environmental Engineering',
            credits: 3,
            semester: 5,
            description: 'Water supply, wastewater treatment, and environmental impact assessment.',
            syllabus: ['Water Treatment', 'Wastewater Treatment', 'Air Pollution', 'Solid Waste', 'EIA', 'Green Buildings'],
            maxStudents: 50
        }
    ],
    'Production & Industrial Engineering': [
        {
            code: 'PI301',
            name: 'Industrial Automation',
            credits: 4,
            semester: 3,
            description: 'PLCs, SCADA systems, robotics, and automated manufacturing.',
            syllabus: ['PLC Programming', 'SCADA', 'Sensors & Actuators', 'Robotics', 'Industrial IoT', 'Industry 4.0'],
            maxStudents: 50
        },
        {
            code: 'PI302',
            name: 'Operations Research',
            credits: 3,
            semester: 3,
            description: 'Linear programming, optimization, queuing theory, and decision analysis.',
            syllabus: ['Linear Programming', 'Transportation Problem', 'Assignment', 'Network Models', 'Queuing Theory', 'Simulation'],
            maxStudents: 50
        },
        {
            code: 'PI401',
            name: 'Supply Chain Management',
            credits: 4,
            semester: 4,
            description: 'Logistics, inventory management, and supply chain optimization.',
            syllabus: ['Supply Chain Basics', 'Inventory Models', 'Logistics', 'Procurement', 'Distribution', 'Analytics'],
            maxStudents: 50
        },
        {
            code: 'PI501',
            name: 'Quality Control',
            credits: 3,
            semester: 5,
            description: 'Statistical quality control, Six Sigma, and total quality management.',
            syllabus: ['SQC', 'Control Charts', 'Acceptance Sampling', 'Six Sigma', 'TQM', 'ISO Standards'],
            maxStudents: 40
        }
    ]
};

// Assignment topics per course
const assignmentTemplates = [
    { title: 'Assignment 1: Fundamentals', maxMarks: 20, weightage: 10 },
    { title: 'Assignment 2: Mid-level Concepts', maxMarks: 30, weightage: 15 },
    { title: 'Assignment 3: Advanced Topics', maxMarks: 40, weightage: 20 },
    { title: 'Final Project', maxMarks: 50, weightage: 25 }
];

// Helper to create date
const daysFromNow = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return Timestamp.fromDate(date);
};

async function seedCourses() {
    console.log('🌱 Starting comprehensive course seeding...\n');

    try {
        // Get PEC organization ID
        const orgsQuery = query(collection(db, 'organizations'), where('slug', '==', 'pec'));
        const orgsSnap = await getDocs(orgsQuery);
        
        if (orgsSnap.empty) {
            console.error('❌ PEC organization not found! Run seedOrganizations.js first.');
            return;
        }

        const orgId = orgsSnap.docs[0].id;
        console.log(`✅ Found organization: ${orgsSnap.docs[0].data().name} (${orgId})\n`);

        // Fetch all faculty by department
        const facultyQuery = query(
            collection(db, 'users'),
            where('role', '==', 'faculty'),
            where('organizationId', '==', orgId)
        );
        const facultySnap = await getDocs(facultyQuery);
        const facultyByDept = {};
        
        facultySnap.docs.forEach(doc => {
            const faculty = { id: doc.id, ...doc.data() };
            const dept = faculty.department;
            if (!facultyByDept[dept]) facultyByDept[dept] = [];
            facultyByDept[dept].push(faculty);
        });

        console.log('👨‍🏫 Faculty by department:');
        Object.keys(facultyByDept).forEach(dept => {
            console.log(`   ${dept}: ${facultyByDept[dept].length} faculty members`);
        });
        console.log('');

        // Fetch all students by department
        const studentsQuery = query(
            collection(db, 'users'),
            where('role', '==', 'student'),
            where('organizationId', '==', orgId)
        );
        const studentsSnap = await getDocs(studentsQuery);
        const studentsByDept = {};
        
        studentsSnap.docs.forEach(doc => {
            const student = { id: doc.id, ...doc.data() };
            const dept = student.department;
            if (!studentsByDept[dept]) studentsByDept[dept] = [];
            studentsByDept[dept].push(student);
        });

        console.log('👨‍🎓 Students by department:');
        Object.keys(studentsByDept).forEach(dept => {
            console.log(`   ${dept}: ${studentsByDept[dept].length} students`);
        });
        console.log('\n📚 Creating courses...\n');

        let totalCourses = 0;
        let totalEnrollments = 0;
        let totalAssignments = 0;
        let totalAttendance = 0;

        // Create courses for each department
        for (const [deptName, courses] of Object.entries(departmentCourses)) {
            console.log(`\n🏛️  ${deptName}`);
            console.log('─'.repeat(50));

            const deptFaculty = facultyByDept[deptName] || [];
            const deptStudents = studentsByDept[deptName] || [];

            if (deptFaculty.length === 0) {
                console.log(`   ⚠️  No faculty found, skipping...`);
                continue;
            }

            for (let i = 0; i < courses.length; i++) {
                const courseData = courses[i];
                const faculty = deptFaculty[i % deptFaculty.length]; // Rotate faculty

                // Check if course already exists
                const existingCourseQuery = query(
                    collection(db, 'courses'),
                    where('code', '==', courseData.code),
                    where('organizationId', '==', orgId)
                );
                const existingCourseSnap = await getDocs(existingCourseQuery);
                
                if (!existingCourseSnap.empty) {
                    console.log(`   ⏭️  ${courseData.code} - Already exists, skipping...`);
                    continue;
                }

                // Create course
                const courseRef = await addDoc(collection(db, 'courses'), {
                    ...courseData,
                    department: deptName,
                    organizationId: orgId,
                    facultyId: faculty.id,
                    facultyName: faculty.fullName,
                    enrolledStudents: 0,
                    status: 'active',
                    schedule: [
                        {
                            day: ['Monday', 'Wednesday', 'Friday'][i % 3],
                            startTime: `${8 + (i * 2)}:00`,
                            endTime: `${9 + (i * 2)}:00`,
                            room: `Room ${300 + i}`
                        }
                    ],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                totalCourses++;
                console.log(`   ✓ ${courseData.code} - ${courseData.name}`);

                // Create faculty assignment
                await addDoc(collection(db, 'facultyAssignments'), {
                    facultyId: faculty.id,
                    courseId: courseRef.id,
                    assignedAt: serverTimestamp()
                });

                // Enroll students (up to maxStudents)
                const enrollCount = Math.min(deptStudents.length, courseData.maxStudents);
                const enrolledStudents = deptStudents.slice(0, enrollCount);

                for (const student of enrolledStudents) {
                    // Create enrollment
                    await addDoc(collection(db, 'enrollments'), {
                        studentId: student.id,
                        courseId: courseRef.id,
                        enrolledAt: serverTimestamp(),
                        status: 'active'
                    });
                    totalEnrollments++;
                }

                // Update course enrolled count
                await updateDoc(courseRef, { enrolledStudents: enrollCount });

                // Create assignments
                for (let j = 0; j < assignmentTemplates.length; j++) {
                    const assignTemplate = assignmentTemplates[j];
                    const assignRef = await addDoc(collection(db, 'assignments'), {
                        courseId: courseRef.id,
                        title: assignTemplate.title,
                        description: `Complete all problems related to ${courseData.syllabus[j] || 'course topics'}`,
                        maxMarks: assignTemplate.maxMarks,
                        weightage: assignTemplate.weightage,
                        dueDate: daysFromNow(20 + (j * 15)),
                        createdAt: serverTimestamp(),
                        organizationId: orgId
                    });
                    totalAssignments++;

                    // Create submissions for students (70% completion rate)
                    for (const student of enrolledStudents) {
                        if (Math.random() > 0.3) { // 70% submit
                            const marks = Math.floor(Math.random() * assignTemplate.maxMarks * 0.4) + 
                                         (assignTemplate.maxMarks * 0.6); // 60-100% range
                            await addDoc(collection(db, 'submissions'), {
                                assignmentId: assignRef.id,
                                studentId: student.id,
                                courseId: courseRef.id,
                                submittedAt: daysFromNow(-5 - j),
                                status: 'graded',
                                marks: marks,
                                feedback: marks > assignTemplate.maxMarks * 0.8 ? 'Excellent work!' : 'Good effort, needs improvement.'
                            });
                        }
                    }
                }

                // Create attendance records (last 20 classes)
                for (let day = -60; day <= 0; day += 3) { // Every 3 days for 20 classes
                    const attendanceDate = daysFromNow(day);
                    
                    for (const student of enrolledStudents) {
                        const present = Math.random() > 0.15; // 85% attendance rate
                        await addDoc(collection(db, 'attendance'), {
                            courseId: courseRef.id,
                            studentId: student.id,
                            date: attendanceDate,
                            status: present ? 'present' : 'absent',
                            markedBy: faculty.id,
                            organizationId: orgId,
                            createdAt: serverTimestamp()
                        });
                        totalAttendance++;
                    }
                }

                // Create grades for students
                for (const student of enrolledStudents) {
                    const totalMarks = 100;
                    const obtainedMarks = Math.floor(Math.random() * 30) + 60; // 60-90 range
                    const percentage = (obtainedMarks / totalMarks) * 100;
                    let grade = 'F';
                    if (percentage >= 90) grade = 'A+';
                    else if (percentage >= 80) grade = 'A';
                    else if (percentage >= 70) grade = 'B';
                    else if (percentage >= 60) grade = 'C';
                    else if (percentage >= 50) grade = 'D';

                    await addDoc(collection(db, 'grades'), {
                        studentId: student.id,
                        courseId: courseRef.id,
                        courseName: courseData.name,
                        courseCode: courseData.code,
                        semester: courseData.semester,
                        totalMarks: totalMarks,
                        obtainedMarks: obtainedMarks,
                        grade: grade,
                        credits: courseData.credits,
                        organizationId: orgId,
                        createdAt: serverTimestamp()
                    });
                }

                console.log(`      → ${enrollCount} students enrolled`);
                console.log(`      → ${assignmentTemplates.length} assignments created`);
                console.log(`      → Attendance & grades recorded`);
            }
        }

        console.log('\n\n✅ Seeding Complete!');
        console.log('═'.repeat(50));
        console.log(`📚 Total Courses: ${totalCourses}`);
        console.log(`👥 Total Enrollments: ${totalEnrollments}`);
        console.log(`📝 Total Assignments: ${totalAssignments}`);
        console.log(`📊 Total Attendance Records: ${totalAttendance}`);
        console.log('═'.repeat(50));

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
}

// Run the seeding
seedCourses()
    .then(() => {
        console.log('\n🎉 All done! You can now see courses in the app.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
