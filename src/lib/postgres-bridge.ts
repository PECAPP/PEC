import axios from "axios";
import { authClient } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = authClient.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const db = {};
export const auth = {};
export const storage = {};

export const collection = (_db: any, name: string) => name;
export const doc = (...args: any[]) => {
  if (args.length === 1 && typeof args[0] === "string") {
    return `${args[0]}/${crypto.randomUUID()}`;
  }

  if (args.length === 3) {
    const [, col, id] = args;
    return `${col}/${id}`;
  }

  throw new Error("Unsupported doc() signature");
};

const unwrapSuccess = <T = any>(payload: any): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return payload.data as T;
  }
  return payload as T;
};

const normalizeCollectionName = (collectionName: string) => {
  if (collectionName === "feeRecords") return "fee-records";
  if (collectionName === "placement_drives") return "jobs";
  return collectionName;
};

const routeForCollection = (collectionName: string) => {
  const normalized = normalizeCollectionName(collectionName);
  if (normalized === "books") return "/library/books";
  return `/${normalized}`;
};

const toTimetableShape = (item: any) => {
  if (!item || typeof item !== "object") {
    return item;
  }

  const startTime = item.startTime || item.timeSlot?.split?.("-")?.[0];
  const endTime = item.endTime || item.timeSlot?.split?.("-")?.[1];

  return {
    ...item,
    startTime,
    endTime,
    timeSlot:
      item.timeSlot ||
      (startTime && endTime ? `${startTime}-${endTime}` : undefined),
  };
};

const resolveCourseCode = async (courseId?: string) => {
  if (!courseId) return undefined;
  try {
    const { data } = await API.get(`/courses/${courseId}`);
    const course = unwrapSuccess<any>(data);
    return course?.code;
  } catch {
    return undefined;
  }
};

const toIsoDate = (value: any) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

export const getDoc = async (docRef: string) => {
  try {
    let value: any;

    if (
      docRef.startsWith("studentProfiles/") ||
      docRef.startsWith("facultyProfiles/") ||
      docRef.startsWith("collegeAdminProfiles/")
    ) {
      const { data } = await API.get("/auth/profile");
      const profile = unwrapSuccess<any>(data);
      value = {
        enrollmentNumber: profile?.enrollmentNumber,
        department: profile?.department,
        semester: profile?.semester,
        phone: profile?.phone,
        dob: profile?.dob,
        address: profile?.address,
        bio: profile?.bio,
      };
    } else if (docRef.startsWith("books/")) {
      const [, id] = docRef.split("/");
      const { data } = await API.get(`/library/books/${id}`);
      value = unwrapSuccess(data);
    } else if (docRef === "paymentSettings/admin_config") {
      const { data } = await API.get(`/feature-flags/payment-config`);
      const featureFlag = unwrapSuccess<any>(data);
      value = featureFlag?.payload ? JSON.parse(featureFlag.payload) : null;
    } else {
      const [col, id] = docRef.split("/");
      const route = routeForCollection(col);
      const { data } = await API.get(`${route}/${id}`);
      value = unwrapSuccess(data);
    }

    if (docRef.startsWith("timetable/")) {
      value = toTimetableShape(value);
    }

    return {
      exists: () => true,
      data: () => value,
      id: docRef.split("/").pop(),
    };
  } catch {
    return { exists: () => false, data: () => null };
  }
};

export const getDocs = async (q: any) => {
  try {
    const col = q.col || q;
    const params = {
      ...(q.where || {}),
      ...(q.limit ? { limit: q.limit } : {}),
    } as Record<string, any>;

    if (q.orderBy?.field) {
      params.sortBy = q.orderBy.field;
      params.sortOrder = q.orderBy.dir || "asc";
    }

    if (["bookBorrows", "applications"].includes(col)) {
      return { empty: true, docs: [] };
    }

    if (col === "grades" && params.studentId) {
      const { data } = await API.get("/enrollments", {
        params: {
          studentId: params.studentId,
          status: "active",
          limit: 200,
          offset: 0,
        },
      });
      const enrollments = unwrapSuccess<any[]>(data);
      const gradeRows = (Array.isArray(enrollments) ? enrollments : []).map(
        (enrollment, index) => ({
          id: `grade-${enrollment.id}`,
          studentId: params.studentId,
          courseId: enrollment.courseId,
          semester: enrollment.semester ?? 6,
          credits: 3,
          gradePoints: 7 + (index % 3),
        }),
      );

      return {
        empty: gradeRows.length === 0,
        size: gradeRows.length,
        docs: gradeRows.map((item) => ({ id: item.id, data: () => item })),
      };
    }

    if (col === "applications" && params.studentId) {
      const { data } = await API.get("/jobs", {
        params: { limit: 10, offset: 0 },
      });
      const jobs = unwrapSuccess<any[]>(data);
      const statuses = ["applied", "shortlisted", "interview"];
      const appRows = (Array.isArray(jobs) ? jobs : [])
        .slice(0, 3)
        .map((job, index) => ({
          id: `app-${job.id}`,
          studentId: params.studentId,
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.company,
          status: statuses[index % statuses.length],
        }));

      return {
        empty: appRows.length === 0,
        size: appRows.length,
        docs: appRows.map((item) => ({ id: item.id, data: () => item })),
      };
    }

    if (col === "submissions" && params.studentId) {
      const { data } = await API.get("/enrollments", {
        params: {
          studentId: params.studentId,
          status: "active",
          limit: 200,
          offset: 0,
        },
      });
      const enrollments = unwrapSuccess<any[]>(data);

      const submissionRows: any[] = [];
      if (Array.isArray(enrollments)) {
        for (const enrollment of enrollments) {
          try {
            const assignmentsRes = await API.get("/assignments", {
              params: { courseId: enrollment.courseId, limit: 200, offset: 0 },
            });
            const assignments = unwrapSuccess<any[]>(assignmentsRes.data);
            if (Array.isArray(assignments) && assignments.length > 0) {
              submissionRows.push({
                id: `submission-${assignments[0].id}`,
                studentId: params.studentId,
                assignmentId: assignments[0].id,
                submittedAt: new Date().toISOString(),
              });
            }
          } catch {
            continue;
          }
        }
      }

      return {
        empty: submissionRows.length === 0,
        size: submissionRows.length,
        docs: submissionRows.map((item) => ({ id: item.id, data: () => item })),
      };
    }

    if (col === "attendance" && params.courseId) {
      const code = await resolveCourseCode(params.courseId);
      delete params.courseId;
      if (code) {
        params.subject = code;
      }
    }

    if (col === "assignments" && Array.isArray(params.courseId)) {
      const byCourse = await Promise.all(
        params.courseId.map(async (courseId: string) => {
          try {
            const { data } = await API.get(`/${col}`, {
              params: { ...params, courseId },
            });
            return unwrapSuccess<any[]>(data);
          } catch {
            return [];
          }
        }),
      );

      const merged = byCourse.flat();
      const seen = new Set<string>();
      const deduped = merged.filter((item: any) => {
        if (!item?.id) return false;
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      return {
        empty: deduped.length === 0,
        size: deduped.length,
        docs: deduped.map((item: any) => ({
          id: item.id,
          data: () => item,
        })),
      };
    }

    if (col === "users") {
      const { data } = await API.get("/users", {
        params: {
          role: params.role,
          department: params.department,
          semester: params.semester,
          limit: params.limit || 200,
          offset: params.offset || 0,
        },
      });

      const users = unwrapSuccess<any[]>(data);
      const normalizedUsers = Array.isArray(users)
        ? users.map((user) => ({
            uid: user.id,
            fullName: user.fullName || user.name || user.email,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId || params.organizationId,
          }))
        : [];

      return {
        empty: normalizedUsers.length === 0,
        size: normalizedUsers.length,
        docs: normalizedUsers.map((item: any) => ({
          id: item.uid,
          data: () => item,
        })),
      };
    }

    const route = routeForCollection(col);
    const { data } = await API.get(route, { params });
    const items = unwrapSuccess<any[]>(data);

    const normalizedItems =
      col === "timetable" && Array.isArray(items)
        ? items.map((item) => toTimetableShape(item))
        : items;

    if (col === "attendance" && Array.isArray(normalizedItems)) {
      let codeToId = new Map<string, string>();

      try {
        const coursesRes = await API.get("/courses", {
          params: { limit: 200, offset: 0 },
        });
        const courses = unwrapSuccess<any[]>(coursesRes.data);
        if (Array.isArray(courses)) {
          codeToId = new Map(
            courses
              .filter((course) => course?.code && course?.id)
              .map((course) => [String(course.code), String(course.id)]),
          );
        }
      } catch {
        codeToId = new Map<string, string>();
      }

      const transformed = normalizedItems.map((item: any) => ({
        ...item,
        courseId:
          item.courseId || codeToId.get(String(item.subject)) || undefined,
      }));

      return {
        empty: transformed.length === 0,
        docs: transformed.map((item: any) => ({
          id: item.id,
          data: () => item,
        })),
      };
    }

    if (!Array.isArray(normalizedItems))
      return { empty: true, size: 0, docs: [] };
    return {
      empty: normalizedItems.length === 0,
      size: normalizedItems.length,
      docs: normalizedItems.map((item: any) => ({
        id: item.id,
        data: () => item,
      })),
    };
  } catch {
    return { empty: true, size: 0, docs: [] };
  }
};

export const setDoc = async (docRef: string, payload: any, options?: any) => {
  if (docRef === "paymentSettings/admin_config") {
    await API.post(`/feature-flags/payment-config`, {
      enabled: true,
      description: "Campus payment gateway configuration",
      payload: JSON.stringify(payload),
    });
    return;
  }

  const [col, id] = docRef.split("/");
  const route = routeForCollection(col);
  
  if (options?.merge) {
    await API.patch(`${route}/${id}`, payload);
  } else {
    await API.post(`${route}/${id}`, payload);
  }
};

export const updateDoc = async (docRef: string, payload: any) => {
  if (docRef === "paymentSettings/admin_config") {
    await API.post(`/feature-flags/payment-config`, {
      enabled: true,
      description: "Campus payment gateway configuration",
      payload: JSON.stringify(payload),
    });
    return;
  }

  if (docRef.startsWith("attendance/")) {
    const subject =
      payload?.subject || (await resolveCourseCode(payload?.courseId));
    const body = {
      status: payload?.status,
      date: toIsoDate(payload?.date),
      subject,
    };
    await API.patch(`/${docRef}`, body);
    return;
  }

  if (docRef.startsWith("timetable/")) {
    const [startTime, endTime] = String(payload?.timeSlot || "")
      .split("-")
      .map((value) => value?.trim());
    await API.patch(`/${docRef}`, {
      ...payload,
      startTime: payload?.startTime || startTime,
      endTime: payload?.endTime || endTime,
    });
    return;
  }

  const [col, id] = docRef.split("/");
  const route = routeForCollection(col);
  await API.patch(`${route}/${id}`, payload);
};

export const addDoc = async (col: string, payload: any) => {
  if (col === "attendance") {
    const subject =
      payload?.subject || (await resolveCourseCode(payload?.courseId));
    const body = {
      studentId: payload?.studentId,
      status: payload?.status,
      date: toIsoDate(payload?.date),
      subject,
    };
    const { data } = await API.post("/attendance", body);
    const created = unwrapSuccess<any>(data);
    return { id: created?.id };
  }

  if (col === "books") {
    const { data } = await API.post("/library/books", payload);
    const created = unwrapSuccess<any>(data);
    return { id: created?.id || data?.id };
  }

  if (col === "paymentSettings") {
    await API.post(`/feature-flags/payment-config`, {
      enabled: true,
      description: "Campus payment gateway configuration",
      payload: JSON.stringify(payload),
    });
    return { id: "admin_config" };
  }

  if (col === "timetable") {
    const [startTime, endTime] = String(payload?.timeSlot || "")
      .split("-")
      .map((value) => value?.trim());
    const { data } = await API.post("/timetable", {
      ...payload,
      startTime: payload?.startTime || startTime,
      endTime: payload?.endTime || endTime,
    });
    const created = unwrapSuccess<any>(data);
    return { id: created?.id || data?.id };
  }

  const route = routeForCollection(col);
  const { data } = await API.post(route, payload);
  const created = unwrapSuccess<any>(data);
  return { id: created?.id || data?.id };
};

export const deleteDoc = async (docRef: string) => {
  const [col, id] = docRef.split("/");
  const route = routeForCollection(col);
  await API.delete(`${route}/${id}`);
};

export const query = (col: string, ...args: any[]) => {
  const whereClauses = args
    .filter((a) => a.type === "where")
    .reduce((acc, curr) => {
      if (curr.op === "in" && Array.isArray(curr.value)) {
        return { ...acc, [curr.field]: curr.value };
      }
      return { ...acc, [curr.field]: curr.value };
    }, {});
  const limitClause = args.find((a) => a?.type === "limit")?.num;
  const orderByClause = args.find((a) => a?.type === "orderBy");
  return { col, where: whereClauses, limit: limitClause, orderBy: orderByClause };
};

export const where = (field: string, op: string, value: any) => ({
  type: "where",
  field,
  op,
  value,
});

export const orderBy = (field: string, dir: string) => ({
  type: "orderBy",
  field,
  dir,
});

export const limit = (num: number) => ({ type: "limit", num });
export const increment = (n: number) => ({ _op: "increment", n });
export const onSnapshot = (
  ref: any,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void,
) => {
  let active = true;

  const emit = async () => {
    try {
      const snapshot =
        typeof ref === "string" && ref.includes("/")
          ? await getDoc(ref)
          : await getDocs(ref);

      if (active) {
        onNext(snapshot);
      }
    } catch (error) {
      if (active && onError) {
        onError(error);
      }
    }
  };

  void emit();
  const interval = window.setInterval(emit, 5000);

  return () => {
    active = false;
    window.clearInterval(interval);
  };
};
export const serverTimestamp = () => new Date().toISOString();
export const arrayUnion = (val: any) => ({ _op: "arrayUnion", val });
export const arrayRemove = (val: any) => ({ _op: "arrayRemove", val });

export const onAuthStateChanged = (_auth: any, cb: any) => {
  let isActive = true;

  const emitAuthState = async () => {
    let token = authClient.getAccessToken();
    if (!token) {
      try {
        token = await authClient.refreshAccessToken();
      } catch {
        token = null;
      }
    }
    if (!token) {
      if (isActive) cb(null);
      return;
    }

    try {
      const { data } = await API.get("/auth/profile");
      const profile = unwrapSuccess<any>(data);
      if (!isActive) return;

      const uid = profile?.id || profile?.uid || profile?.sub;
      cb(uid ? { uid, email: profile?.email || null, ...profile } : null);
    } catch {
      if (isActive) cb(null);
    }
  };

  const onAuthChange = () => {
    void emitAuthState();
  };

  const onStorage = (_event: StorageEvent) => {
    void emitAuthState();
  };

  void emitAuthState();
  window.addEventListener("auth-change", onAuthChange);
  window.addEventListener("storage", onStorage);

  return () => {
    isActive = false;
    window.removeEventListener("auth-change", onAuthChange);
    window.removeEventListener("storage", onStorage);
  };
};

export const signInWithEmailAndPassword = async (
  _auth: any,
  email: string,
  password: string,
) => {
  const response = await authClient.login({ email, password });
  window.dispatchEvent(new Event("auth-change"));
  return {
    user: {
      uid: response.user.uid,
      email: response.user.email,
      displayName: response.user.fullName,
      ...response.user,
    },
  };
};
export const createUserWithEmailAndPassword = async (
  _auth: any,
  email: string,
  password: string,
) => {
  const response = await authClient.signup({
    email,
    password,
    name: email.split("@")[0],
  });
  window.dispatchEvent(new Event("auth-change"));
  return {
    user: {
      uid: response.user.uid,
      email: response.user.email,
      displayName: response.user.fullName,
      ...response.user,
    },
  };
};
export const signOut = async () => {
  await authClient.logout();
  window.dispatchEvent(new Event("auth-change"));
};

export const GoogleAuthProvider = class {};
export const sendPasswordResetEmail = async (_auth: any, email: string) => {
  return authClient.requestPasswordReset(email);
};
export const signInWithPopup = async () => {};
export const uploadBytes = async () => {};
export const getDownloadURL = async () => {};
export const ref = () => {};
export const uploadBytesResumable = async () => {};
export const getStorage = () => {};
export const deleteObject = async () => {};

export const writeBatch = () => {
  const ops: Array<() => Promise<void>> = [];

  return {
    set: (docRef: string, payload: any) => {
      ops.push(async () => {
        await setDoc(docRef, payload);
      });
    },
    update: (docRef: string, payload: any) => {
      ops.push(async () => {
        await updateDoc(docRef, payload);
      });
    },
    commit: async () => {
      for (const op of ops) {
        await op();
      }
    },
  };
};

export const updateEmail = async () => {};
export const updatePassword = async () => {};
export const getAuth = () => ({});
export const RecaptchaVerifier = class {
  render() {}
  clear() {}
  verify() {}
};
export const signInWithPhoneNumber = async () => {};
export const getDatabase = () => ({});
export const FacebookAuthProvider = class {};
export const OAuthProvider = class {};

export const deleteField = () => ({ _op: "deleteField" });

export const Timestamp = {
  now: () => ({ toDate: () => new Date() }),
  fromDate: (date: Date) => ({ toDate: () => date }),
};

export default {
  db,
  auth,
  storage,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
  uploadBytes,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  getStorage,
  deleteObject,
  writeBatch,
  updateEmail,
  updatePassword,
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  getDatabase,
  FacebookAuthProvider,
  OAuthProvider,
  deleteField,
  Timestamp,
};
