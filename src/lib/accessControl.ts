/**
 * Check if user has faculty access to a specific resource
 */
export async function checkFacultyAccess(
  facultyId: string,
  resourceType: 'course' | 'student' | 'assignment',
  resourceId: string
): Promise<boolean> {
  try {
    if (resourceType === 'course') {
      // Check if faculty is assigned to this course
      const assignmentsQuery = query(
        collection(({} as any), 'facultyAssignments'),
        where('facultyId', '==', facultyId),
        where('courseId', '==', resourceId)
      );
      const snapshot = await getDocs(assignmentsQuery);
      return !snapshot.empty;
    }
    
    if (resourceType === 'student') {
      // Check if student is enrolled in any of faculty's courses
      const facultyCourses = await getFacultyAssignments(facultyId);
      const courseIds = facultyCourses.map(c => c.courseId);
      
      const enrollmentQuery = query(
        collection(({} as any), 'enrollments'),
        where('studentId', '==', resourceId),
        where('courseId', 'in', courseIds.slice(0, 10)) // backend filter limit
      );
      const snapshot = await getDocs(enrollmentQuery);
      return !snapshot.empty;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking faculty access:', error);
    return false;
  }
}
 /** Get all courses assigned to a faculty member
export async function getFacultyAssignments(facultyId: string) {
  try {
    const assignmentsQuery = query(
      collection(({} as any), 'facultyAssignments'),
      where('facultyId', '==', facultyId)
    );
    const snapshot = await getDocs(assignmentsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching faculty assignments:', error);
    return [];
  }
}
 /** Filter courses to show only faculty-assigned courses
export async function filterCoursesByFaculty(
  courses: any[],
  facultyId: string
): Promise<any[]> {
  try {
    const assignments = await getFacultyAssignments(facultyId);
    const assignedCourseIds = assignments.map(a => a.courseId);
    
    return courses.filter(course => assignedCourseIds.includes(course.id));
  } catch (error) {
    console.error('Error filtering courses:', error);
    return courses;
  }
}
 /** Filter students to show only those enrolled in faculty's courses
export async function filterStudentsByFaculty(
  students: any[],
  facultyId: string
): Promise<any[]> {
  try {
    const assignments = await getFacultyAssignments(facultyId);
    const courseIds = assignments.map(a => a.courseId);
    
    if (courseIds.length === 0) return [];
    
    // Get all enrollments for faculty's courses
    const enrollmentQuery = query(
      collection(({} as any), 'enrollments'),
      where('courseId', 'in', courseIds.slice(0, 10))
    );
    const snapshot = await getDocs(enrollmentQuery);
    const enrolledStudentIds = new Set(snapshot.docs.map(doc => doc.data().studentId));
    
    return students.filter(student => enrolledStudentIds.has(student.id));
  } catch (error) {
    console.error('Error filtering students:', error);
    return students;
  }
}
 /** Filter attendance records by faculty's courses
export async function filterAttendanceByFaculty(
  attendanceRecords: any[],
  facultyId: string
): Promise<any[]> {
  try {
    const assignments = await getFacultyAssignments(facultyId);
    const courseIds = assignments.map(a => a.courseId);
    
    return attendanceRecords.filter(record => courseIds.includes(record.courseId));
  } catch (error) {
    console.error('Error filtering attendance:', error);
    return attendanceRecords;
  }
}
 /** Check if user has admin or specific role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}
 /** Get faculty-specific data filter
export function getFacultyDataFilter(facultyId: string, dataType: 'courses' | 'students' | 'attendance') {
  return {
    facultyId,
    dataType,
    async apply(data: any[]) {
      switch (dataType) {
        case 'courses':
          return filterCoursesByFaculty(data, facultyId);
        case 'students':
          return filterStudentsByFaculty(data, facultyId);
        case 'attendance':
          return filterAttendanceByFaculty(data, facultyId);
        default:
          return data;
      }
    }
  };
}
 /** Get faculty's assigned course IDs
export async function getFacultyCourseIds(facultyId: string): Promise<string[]> {
  try {
    const assignments = await getFacultyAssignments(facultyId);
    return assignments.map((a: any) => a.courseId);
  } catch (error) {
    console.error('Error getting faculty course IDs:', error);
    return [];
  }
}
 /** Check if student is enrolled in faculty's course
export async function isFacultyStudent(
  facultyId: string,
  studentId: string
): Promise<boolean> {
  try {
    const courseIds = await getFacultyCourseIds(facultyId);
    
    if (courseIds.length === 0) return false;
    
    const enrollmentsQuery = query(
      collection(({} as any), 'enrollments'),
      where('studentId', '==', studentId),
      where('courseId', 'in', courseIds.slice(0, 10)),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(enrollmentsQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking faculty student:', error);
    return false;
  }
}
 /** Check if faculty can perform action on resource
export async function checkFacultyAuthority(
  facultyId: string,
  action: 'view' | 'create' | 'edit' | 'delete',
  resourceType: 'course' | 'assignment' | 'attendance' | 'material' | 'grade' | 'exam',
  resourceData?: any
): Promise<boolean> {
  try {
    const courseIds = await getFacultyCourseIds(facultyId);
    
    if (courseIds.length === 0) return false;
    
    switch (resourceType) {
      case 'course':
        // Faculty can view and edit their assigned courses
        if (action === 'view' || action === 'edit') {
          return courseIds.includes(resourceData?.id || resourceData?.courseId);
        }
        // Cannot create or delete courses
        return false;
      
      case 'assignment':
      case 'material':
      case 'exam':
        // Can create for any of their courses
        if (action === 'create') {
          return courseIds.length > 0;
        }
        // For edit/delete, check if resource belongs to their course
        if (action === 'edit' || action === 'delete') {
          return courseIds.includes(resourceData?.courseId);
        }
        // Can view their course resources
        if (action === 'view') {
          return courseIds.includes(resourceData?.courseId);
        }
        return false;
      
      case 'attendance':
      case 'grade':
        // Full control over attendance and grades for their courses
        if (action === 'create' || action === 'edit' || action === 'delete') {
          return courseIds.includes(resourceData?.courseId);
        }
        if (action === 'view') {
          return courseIds.includes(resourceData?.courseId);
        }
        return false;
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking faculty authority:', error);
    return false;
  }
}
 /** Check if faculty owns/created the resource
export async function isFacultyResource(
  facultyId: string,
  resourceType: 'assignment' | 'material' | 'exam',
  resourceId: string
): Promise<boolean> {
  try {
    // This would check if the resource was created by this faculty
    // For now, we check if it belongs to their course
    const courseIds = await getFacultyCourseIds(facultyId);
    
    // Query the resource collection
    const resourceQuery = query(
      collection(({} as any), `${resourceType}s`),
      where('id', '==', resourceId)
    );
    
    const snapshot = await getDocs(resourceQuery);
    if (snapshot.empty) return false;
    
    const resource = snapshot.docs[0].data();
    return courseIds.includes(resource.courseId);
  } catch (error) {
    console.error('Error checking faculty resource:', error);
    return false;
  }
}
 /** Get faculty permissions for a specific resource
export interface FacultyPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canGrade?: boolean;
  canManageStudents?: boolean;
}

export async function getFacultyPermissions(
  facultyId: string,
  resourceType: 'course' | 'assignment' | 'attendance' | 'material' | 'grade' | 'exam',
  resourceData?: any
): Promise<FacultyPermissions> {
  const permissions: FacultyPermissions = {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  };
  
  try {
    const courseIds = await getFacultyCourseIds(facultyId);
    
    if (courseIds.length === 0) return permissions;
    
    switch (resourceType) {
      case 'course':
        permissions.canView = resourceData ? courseIds.includes(resourceData.id) : true;
        permissions.canEdit = resourceData ? courseIds.includes(resourceData.id) : false;
        permissions.canCreate = false;
        permissions.canDelete = false;
        break;
      
      case 'assignment':
      case 'material':
      case 'exam':
        permissions.canView = resourceData ? courseIds.includes(resourceData.courseId) : true;
        permissions.canCreate = true;
        permissions.canEdit = resourceData ? courseIds.includes(resourceData.courseId) : false;
        permissions.canDelete = resourceData ? courseIds.includes(resourceData.courseId) : false;
        break;
      
      case 'attendance':
      case 'grade':
        permissions.canView = resourceData ? courseIds.includes(resourceData.courseId) : true;
        permissions.canCreate = true;
        permissions.canEdit = resourceData ? courseIds.includes(resourceData.courseId) : false;
        permissions.canDelete = resourceData ? courseIds.includes(resourceData.courseId) : false;
        permissions.canGrade = true;
        permissions.canManageStudents = true;
        break;
    }
    
    return permissions;
  } catch (error) {
    console.error('Error getting faculty permissions:', error);
    return permissions;
  }
}

export default {
  checkFacultyAccess,
  getFacultyAssignments,
  filterCoursesByFaculty,
  filterStudentsByFaculty,
  filterAttendanceByFaculty,
  hasRole,
  getFacultyDataFilter,
  getFacultyCourseIds,
  isFacultyStudent,
  checkFacultyAuthority,
  isFacultyResource,
  getFacultyPermissions,
};
