// js/theme.js (rewritten to improve accessibility and focus handling)

import { app } from "./app.js";
import { saveData, resetData } from "./storage.js";

/**
 * Apply a theme by updating the profile state and the body dataset.
 * Also persist the choice in localStorage.
 *
 * @param {string} theme One of "dark", "blue", or "orange".
 */
export function applyTheme(theme) {
    app.profile.theme = theme;
    document.body.dataset.theme = theme;
    saveData();
}

/**
 * Export the current application state as a JSON file. This can be used
 * for backups or for migrating data to another device.
 */
function exportBackup() {
    const blob = new Blob([JSON.stringify(app, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strain-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Prompt the user for a profile name and store it. Currently this only
 * persists to localStorage, but a real implementation could sync to
 * a backend.
 */
function linkProfile() {
    const name = prompt("Enter profile name:");
    if (!name) return;
    app.profile.name = name.trim();
    saveData();
    alert("Profile saved locally (future: cloud sync).");
}


/**
 * Setup the profile menu interactions. This function attaches event
 * listeners to the profile button and the menu elements so the user
 * can change themes, export data, reset data, or link a profile. It
 * also manages `aria-hidden` and `inert` attributes to ensure that
 * hidden menus do not retain focus in assistive technologies.
 */
export function setupProfileMenu() {
    const profileBtn = document.getElementById("profile-btn");
    const menu = document.getElementById("profile-menu");
    const themeBtn = document.getElementById("theme-btn");
    const submenu = document.getElementById("theme-submenu");
    const backupBtn = document.getElementById("backup-btn");
    const resetBtn = document.getElementById("reset-btn");
    const linkProfileBtn = document.getElementById("link-profile-btn");

    /**
     * Hide both the profile menu and the theme submenu. Also set
     * `aria-hidden` and `inert` so assistive technologies and focus
     * traversal skip these elements. Finally, return focus to the
     * profile button so the user isn’t left on a hidden control.
     */
    function closeAll() {
        menu.style.display = "none";
        submenu.style.display = "none";
        menu.setAttribute("aria-hidden", "true");
        submenu.setAttribute("aria-hidden", "true");
        menu.setAttribute("inert", "");
        submenu.setAttribute("inert", "");
        profileBtn.focus();
    }

    /**
     * Show the profile menu. When opening the menu we remove `inert`
     * and set `aria-hidden` to false so assistive technologies can
     * access the content.
     */
    function openMenu() {
        menu.style.display = "block";
        menu.setAttribute("aria-hidden", "false");
        menu.removeAttribute("inert");
    }

    /**
     * Toggle the theme submenu. When shown, remove `inert` and set
     * `aria-hidden` accordingly; when hidden, set them and do not
     * change focus.
     */
    function toggleSubmenu() {
        const open = submenu.style.display === "block";
        if (open) {
            submenu.style.display = "none";
            submenu.setAttribute("aria-hidden", "true");
            submenu.setAttribute("inert", "");
        } else {
            submenu.style.display = "block";
            submenu.setAttribute("aria-hidden", "false");
            submenu.removeAttribute("inert");
        }
    }

    // Profile button toggles the menu. Clicking outside will call
    // `closeAll()` via the document listener below.
    profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const currentlyOpen = menu.style.display === "block";
        closeAll();
        if (!currentlyOpen) {
            openMenu();
        }
    });

    // The "Change Theme" button toggles the submenu. Stop propagation
    // so it doesn’t trigger closeAll via the document click handler.
    themeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSubmenu();
    });

    // Apply a theme when a theme option is clicked.
    document.querySelectorAll(".theme-option").forEach((btn) => {
        btn.addEventListener("click", () => {
            applyTheme(btn.dataset.theme);
            closeAll();
        });
    });

    // Action buttons: backup, reset and link profile
    backupBtn.addEventListener("click", exportBackup);
    resetBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset ALL data?")) {
            resetData();
        }
    });
    linkProfileBtn.addEventListener("click", linkProfile);

    // Close menus when clicking anywhere else on the page
    document.addEventListener("click", () => closeAll());
}