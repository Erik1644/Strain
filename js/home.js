// js/home.js
import { app } from "./app.js";
import { saveData } from "./storage.js";
import { h, clearElement, getAllExercises, generateID } from "./utils.js";
import { startWorkoutByDayId } from "./workout.js";

const daysListEl = document.getElementById("days-list");
const bestLiftsEl = document.getElementById("best-lifts-list");
const recentWorkoutEl = document.getElementById("recent-workout");
const addDayBtn = document.getElementById("add-day-btn");

let activeMenu = null;

export function setupHome() {
    addDayBtn.addEventListener("click", handleAddDay);
    document.addEventListener("click", closeMenu);
}

export function renderHome() {
    renderDays();
    renderBestLifts();
    renderRecentWorkout();
}

// --------- DAYS ----------

function handleAddDay() {
    const name = prompt("Enter day name:");
    if (!name) return;

    app.days.push({
        id: generateID(),
        name: name.trim(),
        exercises: []
    });

    saveData();
    renderDays();
}

function renderDays() {
    clearElement(daysListEl);

    if (app.days.length === 0) {
        daysListEl.appendChild(
            h("div", { className: "no-data" }, "No training days yet.")
        );
        return;
    }

    app.days.forEach(day => {
        const card = h("div", { className: "day-card" });

        const title = h("h3", {}, day.name);
        card.appendChild(title);

        day.exercises.forEach(ex => {
            card.appendChild(
                h("div", { className: "exercise-item" }, ex.name)
            );
        });

        const startBtn = h(
            "button",
            {
                className: "start-workout-btn",
                onClick: () => startWorkoutByDayId(day.id)
            },
            "Start Workout"
        );

        const menuBtn = h(
            "button",
            {
                className: "menu-btn",
                onClick: ev => openMenuForDay(day, ev)
            },
            "⋯"
        );

        card.appendChild(startBtn);
        card.appendChild(menuBtn);
        daysListEl.appendChild(card);
    });
}

function openMenuForDay(day, event) {
    event.stopPropagation();
    closeMenu();

    const menu = h("div", { className: "menu-dropdown" },
        h("button", {
            onClick: () => {
                closeMenu();
                openDayEditor(day);
            }
        }, "Edit Day"),
        h("button", {
            onClick: () => {
                closeMenu();
                deleteDay(day);
            }
        }, "Delete Day")
    );

    activeMenu = menu;
    event.target.parentElement.appendChild(menu);
}

function closeMenu() {
    if (activeMenu && activeMenu.parentElement) {
        activeMenu.parentElement.removeChild(activeMenu);
    }
    activeMenu = null;
}

function deleteDay(day) {
    if (!confirm(`Delete "${day.name}"?`)) return;
    app.days = app.days.filter(d => d.id !== day.id);
    saveData();
    renderDays();
}

// --------- DAY EDITOR (inline) ----------

function openDayEditor(day) {
    clearElement(daysListEl);

    const card = h("div", { className: "day-card" });

    const titleRow = h("h3", {},
        day.name,
        h("button", {
            className: "edit-name-btn",
            style: "margin-left:8px;",
            onClick: () => {
                const newName = prompt("Edit day name:", day.name);
                if (!newName) return;
                day.name = newName.trim();
                saveData();
                openDayEditor(day);
            }
        }, "✏️")
    );

    const exList = h("div", { id: "exercises-edit-list" });

    function renderExerciseList() {
        clearElement(exList);
        day.exercises.forEach((ex, idx) => {
            exList.appendChild(
                h("div", { className: "exercise-edit-item" },
                    h("span", {}, ex.name),
                    h("button", {
                        className: "remove-exercise-btn",
                        onClick: () => {
                            day.exercises.splice(idx, 1);
                            saveData();
                            renderExerciseList();
                        }
                    }, "-")
                )
            );
        });
    }
    renderExerciseList();

    const addBtn = h("button", {
        className: "add-exercise-btn",
        onClick: () => {
            const name = prompt("Exercise name:");
            if (!name) return;
            day.exercises.push({
                id: generateID(),
                name: name.trim()
            });
            saveData();
            renderExerciseList();
        }
    }, "+");

    const doneBtn = h("button", {
        className: "start-workout-btn",
        onClick: () => renderDays()
    }, "Done Editing");

    card.appendChild(titleRow);
    card.appendChild(exList);
    card.appendChild(
        h("div", { className: "edit-controls" }, addBtn)
    );
    card.appendChild(doneBtn);

    daysListEl.appendChild(card);
}

// --------- BEST LIFTS ----------

function renderBestLifts() {
    clearElement(bestLiftsEl);

    if (!app.bestLifts.length) {
        bestLiftsEl.appendChild(
            h("div", { className: "no-data" }, "No best lifts recorded")
        );
        bestLiftsEl.appendChild(
            h("button", {
                onClick: addBestLift
            }, "+ Add Lift")
        );
        return;
    }

    app.bestLifts.forEach(lift => {
        const row = h("div", { className: "best-lift-item" },
            h("span", {}, lift.exercise),
            h("span", {}, `${lift.weight}kg × ${lift.reps}`),
            h("button", {
                onClick: () => editBestLift(lift)
            }, "Edit"),
            h("button", {
                className: "remove-best-lift-btn",
                onClick: () => removeBestLift(lift)
            }, "🗑️")
        );
        bestLiftsEl.appendChild(row);
    });

    if (app.bestLifts.length < 3) {
        bestLiftsEl.appendChild(
            h("button", { onClick: addBestLift }, "+ Add Lift")
        );
    }
}

function addBestLift() {
    if (app.bestLifts.length >= 3) {
        alert("You can only track up to 3 exercises.");
        return;
    }

    const allExercises = getAllExercises();
    if (!allExercises.length) {
        alert("No exercises available. Add some to your days first.");
        return;
    }

    const chosen = prompt(
        `Choose exercise to track:\n${allExercises.join(", ")}`
    );
    if (!chosen) return;

    const normalized = chosen.trim();
    if (!allExercises.includes(normalized)) {
        alert("Exercise not found. Use the exact name.");
        return;
    }

    if (app.bestLifts.some(l => l.exercise === normalized)) {
        alert("You're already tracking this exercise.");
        return;
    }

    app.bestLifts.push({
        id: generateID(),
        exercise: normalized,
        weight: 0,
        reps: 0
    });

    saveData();
    renderBestLifts();
}

function editBestLift(lift) {
    const allExercises = getAllExercises();
    if (!allExercises.length) {
        alert("No exercises available to track.");
        return;
    }

    const chosen = prompt(
        `Enter exercise name to track:\n${allExercises.join(", ")}`,
        lift.exercise
    );
    if (!chosen) return;

    const normalized = chosen.trim();
    if (!allExercises.includes(normalized)) {
        alert("Exercise not found. Use the exact name.");
        return;
    }

    lift.exercise = normalized;
    lift.weight = 0;
    lift.reps = 0;
    saveData();
    renderBestLifts();
}

function removeBestLift(lift) {
    if (!confirm("Remove this lift from Best Lifts?")) return;
    app.bestLifts = app.bestLifts.filter(l => l.id !== lift.id);
    saveData();
    renderBestLifts();
}

// --------- RECENT WORKOUT ----------

function renderRecentWorkout() {
    clearElement(recentWorkoutEl);

    if (!app.history.length) {
        recentWorkoutEl.appendChild(
            h("div", { className: "no-data" }, "No workouts completed yet")
        );
        return;
    }

    const w = app.history[0];
    recentWorkoutEl.appendChild(
        h("div", { className: "recent-workout" },
            h("div", {}, h("strong", {}, w.dayName)),
            h("div", { className: "recent-workout-date" }, w.date),
            h("div", {}, `${w.volume}kg total volume`)
        )
    );
}
