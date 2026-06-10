import { fakerEN_IN as faker } from '@faker-js/faker';
import { prisma, encryptField, batchForSemester } from './utils';
import { DEPARTMENTS, StudentSeed } from './data';
import { createUserWithRole } from './users';

// Branch codes 101–112 matching DEPARTMENTS order
const DEPT_BRANCH_CODES: Record<string, string> = {
  DS:   '101',
  META: '102',
  EE:   '103',
  MECH: '104',
  CIVIL:'105',
  PROD: '106',
  MNC:  '107',
  AERO: '108',
  VLSI: '109',
  AI:   '110',
  ECE:  '111',
  CSE:  '112',
};

// Admission year from semester: sem 7 = admitted 3 years ago, sem 1 = admitted this year
function admissionYear(semester: number): string {
  const currentYear = new Date().getFullYear();
  const yearsBack = Math.floor((semester - 1) / 2);
  return String(currentYear - yearsBack).slice(-2); // last 2 digits
}

// Enrollment number: YY + BRANCH_CODE + ROLL_NO (3 digits)
// e.g. 25111004 = year 2025, CSE (112), roll 004
function makeEnrollmentNumber(semester: number, deptCode: string, rollNo: number): string {
  const year = admissionYear(semester);
  const branchCode = DEPT_BRANCH_CODES[deptCode] ?? '100';
  return `${year}${branchCode}${String(rollNo).padStart(3, '0')}`;
}

// Department-specific skill pools
const DEPT_SKILLS: Record<string, { name: string; level: number; category: string }[][]> = {
  CSE: [
    [{ name: 'Data Structures & Algorithms', level: 85, category: 'technical' }, { name: 'Java', level: 80, category: 'technical' }, { name: 'System Design', level: 70, category: 'technical' }],
    [{ name: 'Python', level: 90, category: 'technical' }, { name: 'Django', level: 75, category: 'technical' }, { name: 'PostgreSQL', level: 70, category: 'technical' }],
    [{ name: 'Competitive Programming', level: 95, category: 'technical' }, { name: 'C++', level: 92, category: 'technical' }, { name: 'Graph Theory', level: 80, category: 'technical' }],
  ],
  AI: [
    [{ name: 'Machine Learning', level: 85, category: 'technical' }, { name: 'PyTorch', level: 78, category: 'technical' }, { name: 'Computer Vision', level: 72, category: 'technical' }],
    [{ name: 'NLP', level: 80, category: 'technical' }, { name: 'TensorFlow', level: 82, category: 'technical' }, { name: 'Data Analysis', level: 75, category: 'technical' }],
    [{ name: 'Reinforcement Learning', level: 70, category: 'technical' }, { name: 'Scikit-learn', level: 88, category: 'technical' }, { name: 'MLOps', level: 65, category: 'technical' }],
  ],
  DS: [
    [{ name: 'Data Analysis', level: 90, category: 'technical' }, { name: 'Pandas', level: 88, category: 'technical' }, { name: 'Tableau', level: 75, category: 'technical' }],
    [{ name: 'Statistical Modeling', level: 82, category: 'technical' }, { name: 'R Programming', level: 78, category: 'technical' }, { name: 'Power BI', level: 70, category: 'technical' }],
    [{ name: 'Big Data', level: 75, category: 'technical' }, { name: 'Apache Spark', level: 68, category: 'technical' }, { name: 'SQL', level: 92, category: 'technical' }],
  ],
  EE: [
    [{ name: 'Circuit Design', level: 85, category: 'technical' }, { name: 'MATLAB', level: 80, category: 'technical' }, { name: 'Power Systems', level: 78, category: 'technical' }],
    [{ name: 'PLC Programming', level: 72, category: 'technical' }, { name: 'AutoCAD Electrical', level: 75, category: 'technical' }, { name: 'Control Systems', level: 82, category: 'technical' }],
    [{ name: 'Renewable Energy', level: 70, category: 'technical' }, { name: 'SCADA', level: 65, category: 'technical' }, { name: 'Protection Relays', level: 68, category: 'technical' }],
  ],
  ECE: [
    [{ name: 'Embedded Systems', level: 85, category: 'technical' }, { name: 'Arduino', level: 90, category: 'technical' }, { name: 'Signal Processing', level: 78, category: 'technical' }],
    [{ name: 'PCB Design', level: 80, category: 'technical' }, { name: 'Verilog', level: 72, category: 'technical' }, { name: 'Wireless Comm', level: 75, category: 'technical' }],
    [{ name: 'FPGA', level: 70, category: 'technical' }, { name: 'ANSYS', level: 65, category: 'technical' }, { name: 'Microprocessors', level: 82, category: 'technical' }],
  ],
  MECH: [
    [{ name: 'SolidWorks', level: 88, category: 'technical' }, { name: 'AutoCAD', level: 90, category: 'technical' }, { name: 'Thermodynamics', level: 80, category: 'technical' }],
    [{ name: 'ANSYS FEA', level: 78, category: 'technical' }, { name: 'CNC Programming', level: 72, category: 'technical' }, { name: 'GD&T', level: 75, category: 'technical' }],
    [{ name: 'CATIA', level: 82, category: 'technical' }, { name: 'Fluid Simulation', level: 70, category: 'technical' }, { name: 'Lean Manufacturing', level: 65, category: 'technical' }],
  ],
  CIVIL: [
    [{ name: 'AutoCAD', level: 90, category: 'technical' }, { name: 'STAAD Pro', level: 82, category: 'technical' }, { name: 'Structural Analysis', level: 80, category: 'technical' }],
    [{ name: 'Primavera', level: 72, category: 'technical' }, { name: 'ETABS', level: 78, category: 'technical' }, { name: 'Surveying', level: 85, category: 'technical' }],
    [{ name: 'Revit BIM', level: 70, category: 'technical' }, { name: 'Cost Estimation', level: 75, category: 'technical' }, { name: 'GIS Mapping', level: 65, category: 'technical' }],
  ],
  AERO: [
    [{ name: 'ANSYS Fluent', level: 82, category: 'technical' }, { name: 'MATLAB', level: 85, category: 'technical' }, { name: 'Aerodynamics', level: 88, category: 'technical' }],
    [{ name: 'CATIA', level: 78, category: 'technical' }, { name: 'OpenFOAM', level: 70, category: 'technical' }, { name: 'Flight Mechanics', level: 80, category: 'technical' }],
    [{ name: 'Avionics', level: 72, category: 'technical' }, { name: 'XFLR5', level: 68, category: 'technical' }, { name: 'Propulsion', level: 75, category: 'technical' }],
  ],
  VLSI: [
    [{ name: 'Verilog', level: 90, category: 'technical' }, { name: 'VLSI Design', level: 88, category: 'technical' }, { name: 'Cadence', level: 80, category: 'technical' }],
    [{ name: 'VHDL', level: 85, category: 'technical' }, { name: 'FPGA Design', level: 82, category: 'technical' }, { name: 'Synopsys', level: 75, category: 'technical' }],
    [{ name: 'ASIC Verification', level: 78, category: 'technical' }, { name: 'SystemVerilog', level: 80, category: 'technical' }, { name: 'Physical Design', level: 72, category: 'technical' }],
  ],
  MNC: [
    [{ name: 'Algorithm Design', level: 92, category: 'technical' }, { name: 'Python', level: 88, category: 'technical' }, { name: 'Numerical Methods', level: 82, category: 'technical' }],
    [{ name: 'Number Theory', level: 85, category: 'technical' }, { name: 'Cryptography', level: 78, category: 'technical' }, { name: 'Linear Algebra', level: 90, category: 'technical' }],
    [{ name: 'Graph Theory', level: 88, category: 'technical' }, { name: 'Scientific Computing', level: 80, category: 'technical' }, { name: 'MATLAB', level: 82, category: 'technical' }],
  ],
  META: [
    [{ name: 'Materials Characterization', level: 82, category: 'technical' }, { name: 'X-Ray Diffraction', level: 75, category: 'technical' }, { name: 'SEM Analysis', level: 78, category: 'technical' }],
    [{ name: 'Welding Technology', level: 80, category: 'technical' }, { name: 'Heat Treatment', level: 78, category: 'technical' }, { name: 'Corrosion Testing', level: 72, category: 'technical' }],
    [{ name: 'Casting Processes', level: 75, category: 'technical' }, { name: 'Powder Metallurgy', level: 70, category: 'technical' }, { name: 'EBSD Analysis', level: 65, category: 'technical' }],
  ],
  PROD: [
    [{ name: 'CNC Programming', level: 88, category: 'technical' }, { name: 'Lean Manufacturing', level: 85, category: 'technical' }, { name: 'Six Sigma', level: 80, category: 'technical' }],
    [{ name: 'ERP Systems', level: 78, category: 'technical' }, { name: 'Quality Control', level: 82, category: 'technical' }, { name: 'Supply Chain', level: 75, category: 'technical' }],
    [{ name: 'Industry 4.0', level: 72, category: 'technical' }, { name: 'CAD/CAM', level: 85, category: 'technical' }, { name: 'Process Planning', level: 78, category: 'technical' }],
  ],
};

// Department-specific project templates
const DEPT_PROJECTS: Record<string, { title: string; description: string; techStack: string }[]> = {
  CSE: [
    { title: 'Distributed Task Queue System', description: 'Built a Redis-backed distributed task queue with worker pools and retry logic.', techStack: 'Node.js, Redis, Docker, PostgreSQL' },
    { title: 'Real-Time Code Collaboration Tool', description: 'VS Code-style collaborative editor with OT conflict resolution.', techStack: 'WebSockets, React, Yjs, Express' },
    { title: 'Compiler for Subset of C', description: 'Implemented lexer, parser, and code generator for a C subset targeting x86.', techStack: 'C++, LLVM, Flex/Bison' },
    { title: 'Distributed Key-Value Store', description: 'Raft consensus-based KV store with leader election and log replication.', techStack: 'Go, gRPC, etcd' },
    { title: 'Smart Code Review Bot', description: 'GitHub bot that uses LLMs to review PRs and suggest improvements.', techStack: 'Python, GitHub Actions, OpenAI API' },
  ],
  AI: [
    { title: 'Facial Expression Recognition', description: 'CNN model achieving 94% accuracy on AffectNet dataset for emotion classification.', techStack: 'PyTorch, OpenCV, ResNet-50' },
    { title: 'Medical Image Segmentation', description: 'U-Net based model for segmenting tumor regions in MRI scans.', techStack: 'TensorFlow, NumPy, SimpleITK' },
    { title: 'Dialogue Summarization System', description: 'BART fine-tuned on SAMSum dataset for meeting transcript summarization.', techStack: 'HuggingFace, PyTorch, ROUGE' },
    { title: 'RL Agent for Stock Trading', description: 'PPO-trained agent outperforming buy-and-hold on NSE indices by 12%.', techStack: 'Stable-Baselines3, Gym, Pandas' },
    { title: 'Hindi-English NMT System', description: 'Transformer-based neural machine translation with Indic language support.', techStack: 'OpenNMT, PyTorch, SentencePiece' },
  ],
  DS: [
    { title: 'PEC Student Dropout Predictor', description: 'ML pipeline predicting at-risk students using attendance, grades, and engagement data.', techStack: 'Python, XGBoost, Streamlit, PostgreSQL' },
    { title: 'Chandigarh Air Quality Dashboard', description: 'Real-time AQI monitoring and forecasting for Tricity using LSTM models.', techStack: 'Python, LSTM, Plotly Dash, CPCB API' },
    { title: 'E-Commerce Recommendation Engine', description: 'Collaborative filtering system using SVD++ with 78% hit rate @10.', techStack: 'Python, Surprise, FastAPI, Redis' },
    { title: 'Financial Fraud Detection', description: 'Ensemble model on imbalanced transaction data with SMOTE oversampling.', techStack: 'Python, LightGBM, scikit-learn, MLflow' },
    { title: 'Academic Performance Analytics', description: 'End-to-end pipeline analyzing 5 years of PEC exam data to find trends.', techStack: 'Pandas, Airflow, Tableau, PostgreSQL' },
  ],
  EE: [
    { title: 'Smart Grid Load Forecasting', description: 'LSTM-based model for hourly electricity demand prediction in Chandigarh.', techStack: 'Python, LSTM, MATLAB, Scikit-learn' },
    { title: 'Solar MPPT Controller Design', description: 'Designed and simulated P&O MPPT algorithm for 5kW rooftop solar system.', techStack: 'MATLAB/Simulink, PLECS, Arduino' },
    { title: 'Induction Motor Drive System', description: 'Implemented FOC-based variable frequency drive for industrial motor control.', techStack: 'MATLAB/Simulink, dSPACE, TI C2000 DSP' },
    { title: 'Power Quality Analyzer', description: 'Real-time harmonics detection and THD measurement using FFT on Raspberry Pi.', techStack: 'Python, Raspberry Pi, ADS1115 ADC, NumPy' },
    { title: 'EV Charging Station Controller', description: 'Smart charging controller with V2G capability and OCPP protocol implementation.', techStack: 'C, STM32, Python, OCPP WebSockets' },
  ],
  ECE: [
    { title: 'Smart Home Automation Hub', description: 'ESP32-based hub with MQTT, voice control, and energy monitoring for 12 devices.', techStack: 'ESP32, MQTT, Node-RED, Amazon Alexa SDK' },
    { title: 'Software-Defined Radio Receiver', description: 'FM/AM/DAB receiver using RTL-SDR with Python signal processing.', techStack: 'Python, GNU Radio, RTL-SDR, NumPy' },
    { title: 'Wearable ECG Monitor', description: 'Heart rate and arrhythmia detection device with BLE transmission to mobile.', techStack: 'STM32, AD8232, BLE, Android' },
    { title: '5G NR Signal Simulator', description: 'Simulated 5G NR downlink waveforms with PDSCH, PBCH processing chains.', techStack: 'MATLAB 5G Toolbox, Python, GNU Radio' },
    { title: 'Radar-based Gesture Recognition', description: 'mmWave radar-based contactless gesture recognition with 96% accuracy.', techStack: 'TI AWR1642, Python, SVM, OpenCV' },
  ],
  MECH: [
    { title: 'Formula Student Race Car Suspension', description: 'Designed and optimized double-wishbone suspension for FSAE competition.', techStack: 'SolidWorks, ANSYS, ADAMS/View, MATLAB' },
    { title: 'Miniature Gas Turbine Design', description: 'CFD-optimized compressor stage design with 82% isentropic efficiency.', techStack: 'ANSYS CFX, Fluent, Autodesk CFD, CATIA' },
    { title: 'Automated Welding Robot Arm', description: '6-DOF robotic arm with vision-guided welding path planning.', techStack: 'ROS2, OpenCV, SolidWorks, Arduino' },
    { title: 'Topology-Optimized Drone Frame', description: 'Weight-reduced drone frame using SIMP topology optimization in ANSYS.', techStack: 'ANSYS Mechanical, SolidWorks, MATLAB' },
    { title: 'IC Engine Combustion Simulation', description: 'In-cylinder combustion CFD of SI engine at different AFR conditions.', techStack: 'ANSYS Fluent, CONVERGE CFD, Python' },
  ],
  CIVIL: [
    { title: 'Seismic Analysis of Multi-Story Building', description: 'Response spectrum analysis of 15-story RC frame structure in IS 1893 zone IV.', techStack: 'ETABS, STAAD Pro, AutoCAD, SAP2000' },
    { title: 'Smart Traffic Signal System', description: 'AI-based adaptive traffic signal controller using YOLO vehicle detection.', techStack: 'Python, YOLOv8, Raspberry Pi, OpenCV' },
    { title: 'GIS-based Flood Risk Mapping', description: 'Flood risk assessment of Chandigarh using DEM data and HEC-RAS simulation.', techStack: 'ArcGIS, HEC-RAS, QGIS, Python' },
    { title: 'Pothole Detection System', description: 'CNN-based pothole detection on road images with severity classification.', techStack: 'Python, YOLOv5, OpenCV, Flask' },
    { title: 'Sustainable Concrete Mix Design', description: 'Fly-ash and GGBS replacement study for M40 grade concrete with cost analysis.', techStack: 'Excel, MATLAB, AutoCAD, ProStructures' },
  ],
  AERO: [
    { title: 'Supersonic Nozzle CFD Analysis', description: 'Mach 2.5 nozzle flow simulation with oblique shock visualization using Schlieren imaging.', techStack: 'ANSYS Fluent, OpenFOAM, MATLAB, ParaView' },
    { title: 'CubeSat Attitude Control System', description: 'Magnetorquer-based attitude control with Kalman filter for a 3U CubeSat.', techStack: 'MATLAB/Simulink, STM32, Python, GPredict' },
    { title: 'UAV Autonomous Path Planning', description: 'RRT*-based obstacle-avoiding path planner for fixed-wing UAV in 3D terrain.', techStack: 'Python, ROS2, Gazebo, PX4 Autopilot' },
    { title: 'Wing Aerodynamic Shape Optimization', description: 'Adjoint-based shape optimization of transonic wing using XFLR5 + Python.', techStack: 'XFLR5, Python, OpenFOAM, NumPy' },
    { title: 'Ramjet Engine Performance Analysis', description: 'Thermodynamic cycle analysis and component sizing of a ramjet for Mach 3.', techStack: 'MATLAB, Python, EES (Engineering Equation Solver)' },
  ],
  VLSI: [
    { title: '32-bit RISC Processor in Verilog', description: 'Designed and verified a 5-stage pipelined RISC-V processor with hazard detection.', techStack: 'Verilog, ModelSim, Vivado, RISC-V ISA' },
    { title: 'AES Encryption Hardware Accelerator', description: 'Synthesized AES-128 block cipher core on Xilinx FPGA at 200 MHz.', techStack: 'VHDL, Vivado, Xilinx Artix-7, Cadence' },
    { title: '10-bit SAR ADC Design', description: 'Layout and post-layout simulation of SAR ADC achieving ENOB > 9.5 bits at 1 MSPS.', techStack: 'Cadence Virtuoso, Spectre, MATLAB' },
    { title: 'Low-Power SRAM Design', description: '8T SRAM cell designed in 45nm CMOS with 40% leakage reduction vs standard 6T.', techStack: 'Cadence Virtuoso, HSPICE, MATLAB' },
    { title: 'NoC Router Implementation', description: 'Wormhole-routing 2D-mesh Network-on-Chip router with VC flow control.', techStack: 'SystemVerilog, VCS, Vivado, Gem5' },
  ],
  MNC: [
    { title: 'Cryptographic Hash Function Analysis', description: 'Security analysis of SHA-256 variants and implementation of MD5 collision attack.', techStack: 'Python, SageMath, C++, OpenSSL' },
    { title: 'Graph Partitioning Algorithms', description: 'Comparison of spectral, multilevel, and metaheuristic algorithms on real-world social networks.', techStack: 'Python, NetworkX, MATLAB, R' },
    { title: 'Finite Element Method Solver', description: 'General-purpose 2D FEM solver for Poisson and Laplace equations on unstructured meshes.', techStack: 'Python, NumPy, SciPy, Matplotlib' },
    { title: 'Homomorphic Encryption Library', description: 'Partial HE library supporting addition and multiplication on encrypted integers (BFV scheme).', techStack: 'C++, SEAL Library, Python, GMP' },
    { title: 'Computational Fluid Dynamics Solver', description: 'Navier-Stokes solver using finite difference method for 2D incompressible flow.', techStack: 'Python, NumPy, Matplotlib, MATLAB' },
  ],
  META: [
    { title: 'Corrosion Inhibitor Study on Steel', description: 'Electrochemical analysis of plant-extract-based corrosion inhibitors on mild steel in HCl.', techStack: 'Electrochemical Workstation, MATLAB, Origin Pro' },
    { title: 'ECAP-processed Aluminium Characterization', description: 'Microstructural evolution and hardness mapping of Al6061 after Equal Channel Angular Pressing.', techStack: 'EBSD, SEM, XRD, MATLAB' },
    { title: 'Heat Exchanger Alloy Selection', description: 'Multi-criteria material selection for industrial heat exchanger using AHP and TOPSIS.', techStack: 'MATLAB, Python, ASM Material Database, Excel' },
    { title: 'Additive Manufactured Ti64 Analysis', description: 'Defect characterization of SLM-printed Ti-6Al-4V using X-Ray CT and porosity analysis.', techStack: 'VGStudio, ImageJ, MATLAB, ASTM Standards' },
    { title: 'Steel Slag Valorization Study', description: 'Use of BOF slag as partial cement replacement — compressive strength and durability study.', techStack: 'IS Standards, Origin Pro, SEM, MATLAB' },
  ],
  PROD: [
    { title: 'Automated Visual Inspection System', description: 'CNN-based surface defect detection on machined components achieving 98.2% accuracy.', techStack: 'Python, YOLOv8, OpenCV, Raspberry Pi, TensorFlow' },
    { title: 'Lean VSM Analysis for Automotive Plant', description: 'Value stream mapping and Kaizen event planning reducing cycle time by 23%.', techStack: 'Visio, Excel, AutoCAD, Minitab' },
    { title: 'CNC Machining Parameter Optimization', description: 'RSM-based optimization of turning parameters for minimum surface roughness of SS304.', techStack: 'Minitab, Design Expert, MATLAB, ANSYS' },
    { title: 'AGV Path Planning for Smart Factory', description: 'A*-algorithm based AGV routing with collision avoidance in a simulated factory floor.', techStack: 'Python, ROS2, Gazebo, SLAM, OpenCV' },
    { title: 'Ergonomic Workstation Redesign', description: 'RULA-based ergonomic assessment and redesign reducing musculoskeletal risk scores by 40%.', techStack: 'AutoCAD, SolidWorks, CATIA, MATLAB' },
  ],
};

// Skill sets that cut across all departments
const SOFT_SKILLS = [
  { name: 'Technical Writing', level: 75, category: 'soft' },
  { name: 'Public Speaking', level: 70, category: 'soft' },
  { name: 'Team Leadership', level: 80, category: 'soft' },
  { name: 'Problem Solving', level: 85, category: 'soft' },
  { name: 'Time Management', level: 72, category: 'soft' },
  { name: 'Research Skills', level: 78, category: 'soft' },
];

export async function seedStudents(passwordHash: string): Promise<StudentSeed[]> {
  const students: StudentSeed[] = [];
  console.log(`Seeding students for ${DEPARTMENTS.length} departments...`);

  const SEMESTER_DISTRIBUTION_EXTENDED = [
    1, 1, 1, 1, 1, 1,   // 6 × sem 1
    3, 3, 3, 3, 3, 3,   // 6 × sem 3
    5, 5, 5, 5, 5, 5,   // 6 × sem 5 (should match 5 in your dist, adding one extra for 30 total)
    7, 7, 7, 7, 7, 7,   // 6 × sem 7
    1, 3, 5, 7,         // extras to pad to 30
    1, 3,
  ];

  // Track roll numbers per (semester, dept) combination for unique enrollment numbers
  const rollCounters: Record<string, number> = {};

  for (let deptIndex = 0; deptIndex < DEPARTMENTS.length; deptIndex += 1) {
    const department = DEPARTMENTS[deptIndex];
    const deptSkillPool = DEPT_SKILLS[department.code] ?? DEPT_SKILLS['CSE'];
    const deptProjectPool = DEPT_PROJECTS[department.code] ?? DEPT_PROJECTS['CSE'];

    for (let studentIndex = 0; studentIndex < 30; studentIndex += 1) {
      const semester = SEMESTER_DISTRIBUTION_EXTENDED[studentIndex % SEMESTER_DISTRIBUTION_EXTENDED.length];

      // Unique roll number per (year, dept) bucket
      const rollKey = `${admissionYear(semester)}-${department.code}`;
      rollCounters[rollKey] = (rollCounters[rollKey] ?? 0) + 1;
      const rollNo = rollCounters[rollKey];

      const isArjun = deptIndex === 0 && studentIndex === 0;
      const firstName = isArjun ? 'Arjun' : faker.person.firstName();
      const lastName = isArjun ? 'Sharma' : faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const email = isArjun ? 'student@pec.edu' : faker.internet.email({ firstName, lastName, provider: 'pec.edu' }).toLowerCase();

      const batch = batchForSemester(semester);
      const enrollmentNumber = makeEnrollmentNumber(semester, department.code, rollNo);

      const user = await createUserWithRole({
        email,
        name: fullName,
        role: 'student',
        passwordHash,
        githubUsername: faker.internet.username({ firstName, lastName }),
        linkedinUsername: `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${faker.string.alphanumeric(4)}`,
        isPublicProfile: Math.random() > 0.1,
      });

      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          enrollmentNumber,
          department: department.name,
          semester,
          phone: encryptField(faker.phone.number({ style: 'national' })),
          dob: faker.date.birthdate({ min: 18, max: 22, mode: 'age' }),
          address: encryptField(faker.location.streetAddress(true) + ', Chandigarh'),
          bio: encryptField(faker.person.bio()),
        },
        create: {
          userId: user.id,
          enrollmentNumber,
          department: department.name,
          semester,
          phone: encryptField(faker.phone.number({ style: 'national' })),
          dob: faker.date.birthdate({ min: 18, max: 22, mode: 'age' }),
          address: encryptField(faker.location.streetAddress(true) + ', Chandigarh'),
          bio: encryptField(faker.person.bio()),
        },
      });

      // Resume profile
      await prisma.resumeProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          personalInfo: { email, name: fullName, phone: faker.phone.number({ style: 'national' }) },
          education: [{ institution: 'Punjab Engineering College', degree: 'B.Tech', branch: department.name, year: parseInt(`20${admissionYear(semester)}`) + 4 }],
          experience: semester >= 5 ? [{ company: faker.company.name(), role: `${department.specializations[0]} Intern`, duration: '2 months' }] : [],
          projects: deptProjectPool.slice(0, Math.min(2, deptProjectPool.length)).map(p => ({ name: p.title, tech: p.techStack.split(',')[0].trim() })),
          skills: (deptSkillPool[studentIndex % deptSkillPool.length] ?? deptSkillPool[0]).map(s => s.name),
        },
      });

      // 1-2 unique projects per student
      const numProjects = faker.number.int({ min: 1, max: 3 });
      const usedProjects = faker.helpers.arrayElements(deptProjectPool, Math.min(numProjects, deptProjectPool.length));
      for (const proj of usedProjects) {
        await prisma.studentProject.create({
          data: {
            studentId: user.id,
            title: proj.title,
            description: proj.description,
            techStack: proj.techStack,
            githubUrl: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}/${proj.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`,
            isFeatured: Math.random() > 0.6,
          },
        });
      }

      // Dept-specific + 1 soft skill
      const skillSet = deptSkillPool[studentIndex % deptSkillPool.length] ?? deptSkillPool[0];
      const softSkill = SOFT_SKILLS[studentIndex % SOFT_SKILLS.length];
      await prisma.studentSkill.createMany({
        data: [
          ...skillSet.map(s => ({ studentId: user.id, name: s.name, level: faker.number.int({ min: s.level - 10, max: Math.min(s.level + 10, 100) }), category: s.category })),
          { studentId: user.id, name: softSkill.name, level: faker.number.int({ min: 65, max: 90 }), category: 'soft' },
        ],
        skipDuplicates: true,
      });

      students.push({
        id: user.id,
        name: fullName,
        departmentCode: department.code,
        departmentName: department.name,
        semester,
        batch,
      });
    }
  }

  return students;
}
