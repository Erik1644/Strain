// js/app.js

// Global application state
export const app = {
    days: [],
    currentWorkout: null,
    bestLifts: [],
    history: [], // completed workouts
    profile: {
        name: null,
        theme: "dark"
    }
};

export function initializeDefaultData() {
    if (app.days.length === 0) {
        app.days = [
            {
                id: crypto.randomUUID(),
                name: "Push Day",
                exercises: [
                    { id: crypto.randomUUID(), name: "Bench Press" },
                    { id: crypto.randomUUID(), name: "Overhead Press" }
                ]
            }
        ];
    }
}
