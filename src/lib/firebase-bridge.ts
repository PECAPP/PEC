import { authClient } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Simplified Fetch Wrapper to match the original Axios usage
const request = async (method: string, url: string, body?: any, params?: any) => {
  const token = authClient.getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let finalUrl = `${API_BASE_URL}${url}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    finalUrl += `?${searchParams.toString()}`;
  }

  const response = await fetch(finalUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return { data: await response.json() };
};

const API = {
  get: (url: string, options?: any) => request("GET", url, undefined, options?.params),
  post: (url: string, body: any) => request("POST", url, body),
  patch: (url: string, body: any) => request("PATCH", url, body),
  delete: (url: string) => request("DELETE", url),
};

// Mock Firestore
export const db = {};
export const auth = {};
export const storage = {};

export const collection = (db: any, name: string) => name;
export const doc = (db: any, col: string, id: string) => `${col}/${id}`;
export const getDoc = async (docRef: string) => {
  try {
    const { data } = await API.get(`/${docRef}`);
    return {
      exists: () => true,
      data: () => data,
      id: docRef.split("/").pop(),
    };
  } catch {
    return { exists: () => false, data: () => null };
  }
};
export const getDocs = async (q: any) => {
  try {
    const { data } = await API.get(`/${q.col || q}`, { params: q.where });
    if (!Array.isArray(data)) return { empty: true, docs: [] };
    return {
      empty: data.length === 0,
      docs: data.map((item: any) => ({
        id: item.id,
        data: () => item,
      })),
    };
  } catch {
    return { empty: true, docs: [] };
  }
};
export const setDoc = async (docRef: string, payload: any, _options?: any) => {
  await API.post(`/${docRef}`, payload);
};
export const updateDoc = async (docRef: string, payload: any) => {
  await API.patch(`/${docRef}`, payload);
};
export const addDoc = async (col: string, payload: any) => {
  const { data } = await API.post(`/${col}`, payload);
  return { id: data.id };
};
export const deleteDoc = async (docRef: string) => {
  await API.delete(`/${docRef}`);
};

export const query = (col: string, ...args: any[]) => {
  const whereClauses = args
    .filter((a) => a.type === "where")
    .reduce((acc, curr) => ({ ...acc, [curr.field]: curr.value }), {});
  return { col, where: whereClauses };
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
export const onSnapshot = (_q: any, _cb: (s: any) => void) => {
  return () => {};
};
export const serverTimestamp = () => new Date().toISOString();
export const arrayUnion = (val: any) => ({ _op: "arrayUnion", val });
export const arrayRemove = (val: any) => ({ _op: "arrayRemove", val });

// Auth Mock
export const onAuthStateChanged = (auth: any, cb: any) => {
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
      if (!isActive) return;

      const uid = data?.id || data?.uid || data?.sub;
      cb(uid ? { uid, email: data?.email || null, ...data } : null);
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
export const signInWithEmailAndPassword = async () => {};
export const createUserWithEmailAndPassword = async () => {};
export const signOut = async () => {
  await authClient.logout();
  window.dispatchEvent(new Event("auth-change"));
};

export const GoogleAuthProvider = class {};
export const sendPasswordResetEmail = async () => {};
export const signInWithPopup = async () => {};
export const uploadBytes = async () => {};
export const getDownloadURL = async () => {};
export const ref = () => {};
export const uploadBytesResumable = async () => {};
export const getStorage = () => {};
export const deleteObject = async () => {};

export const writeBatch = () => ({
  set: () => {},
  update: () => {},
  commit: async () => {},
});
export const updateEmail = async () => {};
export const updatePassword = async () => {};
export const getAuth = () => ({});
export const RecaptchaVerifier = class {
  render() {}
  clear() {}
  verify() {}
};
export const signInWithPhoneNumber = async () => {};
export const getFirestore = () => ({});
export const FacebookAuthProvider = class {};
export const OAuthProvider = class {};

export const deleteField = () => ({ _op: "deleteField" });

export const Timestamp = { now: () => ({ toDate: () => new Date() }) };

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
  getFirestore,
  FacebookAuthProvider,
  OAuthProvider,
  deleteField,
  Timestamp,
};
