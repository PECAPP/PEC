const fs = require('fs');
const path = require('path');

// List of files that need React imports restored
const filesToFix = [
  'src/pages/Users.tsx',
  'src/pages/Timetable.tsx',
  'src/pages/Students.tsx',
  'src/pages/StudentProfile.tsx',
  'src/pages/Settings.tsx',
  'src/pages/Search.tsx',
  'src/pages/RoomBooking.tsx',
  'src/pages/ResumeBuilderIvyLeague.tsx',
  'src/pages/PublicStudentProfile.tsx',
  'src/pages/Placements.tsx',
  'src/pages/Finance.tsx',
  'src/pages/CampusMap.tsx',
  'src/pages/college/Faculty.tsx',
  'src/pages/dashboards/StudentDashboard.tsx',
  'src/pages/dashboards/CollegeAdminDashboard.tsx',
  'src/pages/dashboards/SuperAdminDashboard.tsx',
  'src/pages/placement/MyPlacementDashboard.tsx',
  'src/pages/placement/PlacementApplications.tsx',
  'src/pages/placement/PlacementDrives.tsx',
  'src/pages/placement/PlacementProfile.tsx',
  'src/pages/placement/PlacementReports.tsx',
  'src/pages/placement/Recruiters.tsx',
  'src/pages/placement/StudentReadiness.tsx',
  'src/pages/placement/OfferManagement.tsx',
  'src/pages/placement/Jobs.tsx',
  'src/pages/placement/InterviewSchedule.tsx',
  'src/pages/placement/CareerPortal.tsx',
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // Fix: /* import { useState, useEffect } from 'react'; */ → import { useState, useEffect } from 'react';
  content = content.replace(
    /\/\* import \{ (.*?useState.*?useEffect.*?) \} from ['"]react['"]; \*/,
    'import { $1 } from \'react\';'
  );

  // Also handle variations with useNavigate from react-router-dom
  content = content.replace(
    /\/\* import \{ (.*?useNavigate.*?) \} from ['"]react-router-dom['"]; \*/,
    'import { $1 } from \'react-router-dom\';'
  );

  // Fix double quoted versions
  content = content.replace(
    /\/\* import \{ (.*?useState.*?useEffect.*?) \} from "react"; \*/,
    'import { $1 } from "react";'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`⏭️  No changes needed for ${file}`);
  }
});

console.log('\n✨ Import restoration complete!');
