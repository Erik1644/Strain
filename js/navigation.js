// js/navigation.js

const screens = {
    home: document.getElementById("home-screen"),
    workout: document.getElementById("workout-screen"),
    progress: document.getElementById("progress-screen"),
};

const tabs = {
    home: document.getElementById("home-tab"),
    workout: document.getElementById("workout-tab"),
    progress: document.getElementById("progress-tab"),
};

export function switchScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    Object.values(tabs).forEach(t => t.classList.remove("active"));

    screens[name].classList.add("active");
    tabs[name].classList.add("active");
}

export function setupNavigation() {
    tabs.home.addEventListener("click", () => switchScreen("home"));
    tabs.workout.addEventListener("click", () => switchScreen("workout"));
    tabs.progress.addEventListener("click", () => switchScreen("progress"));
}
