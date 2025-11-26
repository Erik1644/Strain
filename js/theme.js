// js/theme.js
import { app } from "./app.js";
import { saveData, resetData } from "./storage.js";

export function applyTheme(theme) {
    app.profile.theme = theme;
    document.body.dataset.theme = theme;
    saveData();
}

function exportBackup() {
    const blob = new Blob([JSON.stringify(app, null, 2)], {
        type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strain-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function linkProfile() {
    const name = prompt("Enter profile name:");
    if (!name) return;
    app.profile.name = name;
    saveData();
    alert("Profile saved locally (future: cloud sync).");
}

export function setupProfileMenu() {
    const profileBtn = document.getElementById("profile-btn");
    const menu = document.getElementById("profile-menu");
    const themeBtn = document.getElementById("theme-btn");
    const submenu = document.getElementById("theme-submenu");
    const backupBtn = document.getElementById("backup-btn");
    const resetBtn = document.getElementById("reset-btn");
    const linkProfileBtn = document.getElementById("link-profile-btn");

    function closeAll() {
        menu.style.display = "none";
        submenu.style.display = "none";
    }

    profileBtn.addEventListener("click", e => {
        e.stopPropagation();
        const open = menu.style.display === "block";
        closeAll();
        if (!open) menu.style.display = "block";
    });

    themeBtn.addEventListener("click", e => {
        e.stopPropagation();
        submenu.style.display =
            submenu.style.display === "block" ? "none" : "block";
    });

    document.querySelectorAll(".theme-option").forEach(btn => {
        btn.addEventListener("click", () => {
            applyTheme(btn.dataset.theme);
            closeAll();
        });
    });

    backupBtn.addEventListener("click", exportBackup);
    resetBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset ALL data?")) {
            resetData();
        }
    });
    linkProfileBtn.addEventListener("click", linkProfile);

    document.addEventListener("click", () => closeAll());
}
