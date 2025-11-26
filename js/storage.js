// js/storage.js
import { app } from "./app.js";

const STORAGE_KEY = "strain-data-v2";

export function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    try {
        const parsed = JSON.parse(raw);
        Object.assign(app, parsed);
        return true;
    } catch (err) {
        console.error("Failed to load data:", err);
        return false;
    }
}

export function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(app));
}

export function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
}
