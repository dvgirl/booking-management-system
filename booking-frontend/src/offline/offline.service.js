import { openDB } from "idb";

export const dbPromise = openDB("booking-hybrid-db", 1, {
  upgrade(db) {
    db.createObjectStore("bookings", { keyPath: "id" });
    db.createObjectStore("payments", { keyPath: "id" });
    db.createObjectStore("documents", { keyPath: "id" });
  }
});

export const saveOffline = async (store, data) => {
  const db = await dbPromise;
  await db.put(store, data);
};

export const getOffline = async (store) => {
  const db = await dbPromise;
  return db.getAll(store);
};

export const deleteOffline = async (store, id) => {
  const db = await dbPromise;
  await db.delete(store, id);
};
