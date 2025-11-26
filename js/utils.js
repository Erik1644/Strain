// js/utils.js
import { app } from "./app.js";

export function generateID() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
}

// Tiny DOM helper (component-style)
export function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);

    if (props.className) {
        el.className = props.className;
    }

    for (const [key, value] of Object.entries(props)) {
        if (key === "className") continue;
        if (key.startsWith("on") && typeof value === "function") {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key in el) {
            el[key] = value;
        } else {
            el.setAttribute(key, value);
        }
    }

    for (const child of children.flat()) {
        if (child == null) continue;
        el.appendChild(
            child instanceof Node ? child : document.createTextNode(String(child))
        );
    }

    return el;
}

export function clearElement(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
}

// ---- Data helpers ----
export function getAllExercises() {
    return [...new Set(
        app.days.flatMap(day => day.exercises.map(ex => ex.name))
    )];
}

export function calculateVolume(workout) {
    return workout.exercises.reduce((total, ex) => {
        return total + ex.sets.reduce(
            (sum, set) => sum + set.weight * set.reps,
            0
        );
    }, 0);
}

// Find latest exercise data from history (most recent)
export function findLatestExerciseData(exerciseName) {
    for (const workout of app.history) {
        const ex = workout.exercises.find(e => e.name === exerciseName);
        if (ex) return ex;
    }
    return null;
}

// Update best lifts (if exercise is tracked)
export function updateBestLifts(exerciseName, weight, reps) {
    const lift = app.bestLifts.find(l => l.exercise === exerciseName);
    if (!lift) return;

    const better =
        weight > lift.weight ||
        (weight === lift.weight && reps > lift.reps);

    if (better) {
        lift.weight = weight;
        lift.reps = reps;
    }
}
