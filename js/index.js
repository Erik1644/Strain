// js/index.js
import { app, initializeDefaultData } from "./app.js";
import { loadData, saveData } from "./storage.js";
import { setupNavigation, switchScreen } from "./navigation.js";
import { setupProfileMenu, applyTheme } from "./theme.js";
import { setupHome, renderHome } from "./home.js";
import { renderWorkout } from "./workout.js";
import { renderProgress } from "./progress.js";

// Load or init data
const loaded = loadData();
if (!loaded) initializeDefaultData();

// Apply saved theme
applyTheme(app.profile.theme || "dark");

// Setup UI systems
setupNavigation();
setupProfileMenu();
setupHome();

// Initial render
renderHome();
renderWorkout();
renderProgress();
switchScreen("home");

// React to workout completion
document.addEventListener("workout:finished", () => {
    renderHome();
    renderProgress();
    switchScreen("home");
});

// Save on unload
window.addEventListener("beforeunload", saveData);

// Service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("service-worker.js")
            .then(reg => console.log("Service Worker registered.", reg))
            .catch(err => console.log("Service Worker failed:", err));
    });
}
