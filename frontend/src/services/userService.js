// src/services/userService.js

import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export async function getUserById(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("User not found");
  }

  return { uid: docSnap.id, ...docSnap.data() };
}
