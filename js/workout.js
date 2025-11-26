// js/workout.js
import { app } from "./app.js";
import { saveData } from "./storage.js";
import {
    h,
    clearElement,
    findLatestExerciseData,
    calculateVolume,
    updateBestLifts
} from "./utils.js";
import { switchScreen } from "./navigation.js";

const titleEl = document.getElementById("workout-title");
const logEl = document.getElementById("exercises-log");

let quickAddBtn = null;

export function renderWorkout() {
    const workout = app.currentWorkout;
    clearElement(logEl);

    if (!workout) {
        titleEl.textContent = "Workout Logging";
        logEl.appendChild(
            h("div", { className: "no-data" },
                "No active workout. Start one from the Home tab!"
            )
        );
        removeQuickAdd();
        return;
    }

    titleEl.textContent = workout.dayName;

    workout.exercises.forEach((ex, index) => {
        const isCurrent = index === workout.currentExerciseIndex;
        const isCompleted = index < workout.currentExerciseIndex;

        const exCard = h("div", {
            className: "exercise-log" +
                (isCompleted ? " completed" : "") +
                (isCurrent ? " current" : "")
        });

        exCard.appendChild(h("h3", {}, ex.name));

        if (ex.sets.length) {
            ex.sets.forEach((set, i) => {
                exCard.appendChild(
                    h("p", {}, `Set ${i + 1}: ${set.weight}kg x ${set.reps}`)
                );
            });
        } else {
            exCard.appendChild(
                h("p", {}, "No sets logged yet")
            );
        }

        if (isCurrent) {
            exCard.appendChild(buildInputSection(workout, ex, index));
        }

        logEl.appendChild(exCard);
    });

    ensureQuickAdd();
}

export function startWorkoutByDayId(dayId) {
    const day = app.days.find(d => d.id === dayId);
    if (!day) {
        alert("Day not found");
        return;
    }
    if (!day.exercises.length) {
        alert("This day has no exercises!");
        return;
    }

    app.currentWorkout = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        dayId: day.id,
        dayName: day.name,
        currentExerciseIndex: 0,
        exercises: day.exercises.map(ex => ({
            name: ex.name,
            sets: []
        }))
    };

    saveData();
    switchScreen("workout");
    renderWorkout();
}

// --------- Input section / actions ----------

function buildInputSection(workout, ex, index) {
    const container = h("div", { className: "current-exercise-input" });

    const latest = findLatestExerciseData(ex.name);
    const nextSetNumber = ex.sets.length + 1;

    let defaultWeight = "";
    let defaultReps = "";

    if (latest && latest.sets[nextSetNumber - 1]) {
        defaultWeight = latest.sets[nextSetNumber - 1].weight;
        defaultReps = latest.sets[nextSetNumber - 1].reps;
    }

    if (latest) {
        container.appendChild(
            h("div", { className: "previous-week-hint" },
                `Last time: Set ${nextSetNumber} - ` +
                `${defaultWeight || "..."}kg x ${defaultReps || "..."}`
            )
        );
    }

    const weightInput = h("input", {
        type: "number",
        placeholder: "Weight (kg)",
        value: defaultWeight
    });
    const repsInput = h("input", {
        type: "number",
        placeholder: "Reps",
        value: defaultReps
    });

    const inputRow = h("div", { className: "set-input" }, weightInput, repsInput);

    const logBtn = h("button", {
        className: "add-set-btn",
        onClick: () => {
            const weight = parseFloat(weightInput.value);
            const reps = parseInt(repsInput.value, 10);
            if (!weight || weight <= 0 || !reps || reps <= 0) {
                alert("Enter positive numbers for weight and reps.");
                return;
            }
            ex.sets.push({ weight, reps });
            updateBestLifts(ex.name, weight, reps);
            saveData();
            renderWorkout();
        }
    }, `Log Set ${nextSetNumber}`);

    const undoBtn = h("button", {
        className: "add-set-btn",
        onClick: () => {
            if (!ex.sets.length) {
                alert("No sets to undo!");
                return;
            }
            ex.sets.pop();
            saveData();
            renderWorkout();
        }
    }, "Undo Last Set");

    const nextBtn = h("button", {
        className: "add-set-btn",
        onClick: () => {
            if (workout.currentExerciseIndex < workout.exercises.length - 1) {
                workout.currentExerciseIndex++;
                saveData();
                renderWorkout();
            } else {
                finishWorkout();
            }
        }
    }, workout.currentExerciseIndex < workout.exercises.length - 1
        ? "Next Exercise"
        : "Finish Workout"
    );

    container.appendChild(inputRow);
    container.appendChild(
        h("div", {}, logBtn, undoBtn, nextBtn)
    );

    return container;
}

// --------- Quick Add Exercise ----------

function ensureQuickAdd() {
    if (quickAddBtn) return;

    quickAddBtn = document.createElement("button");
    quickAddBtn.id = "quick-add-btn";
    quickAddBtn.textContent = "＋";

    quickAddBtn.addEventListener("click", () => {
        const workout = app.currentWorkout;
        if (!workout) return;
        const name = prompt("Enter exercise name:");
        if (!name) return;

        workout.exercises.push({
            name: name.trim(),
            sets: []
        });
        saveData();
        renderWorkout();
    });

    document.body.appendChild(quickAddBtn);
}

function removeQuickAdd() {
    if (quickAddBtn && quickAddBtn.parentElement) {
        quickAddBtn.parentElement.removeChild(quickAddBtn);
    }
    quickAddBtn = null;
}

// --------- Finish workout ----------

function finishWorkout() {
    const workout = app.currentWorkout;
    if (!workout) return;

    const volume = calculateVolume(workout);

    const historyEntry = {
        id: workout.id,
        date: workout.date,
        dayId: workout.dayId,
        dayName: workout.dayName,
        volume,
        exercises: workout.exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets.map(s => ({ ...s }))
        }))
    };

    app.history.unshift(historyEntry);
    app.currentWorkout = null;
    saveData();
    removeQuickAdd();

    // Let index.js decide what to re-render
    document.dispatchEvent(new CustomEvent("workout:finished"));
}
