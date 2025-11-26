// js/progress.js
import { app } from "./app.js";

let chartInstance = null;

export function renderProgress() {
    const historyEl = document.getElementById("workout-history");
    const canvas = document.getElementById("volumeChart");

    historyEl.innerHTML = "";

    if (!app.history.length) {
        const div = document.createElement("div");
        div.className = "no-data";
        div.textContent = "No workout history yet";
        historyEl.appendChild(div);
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        return;
    }

    app.history.forEach(w => {
        const card = document.createElement("div");
        card.className = "progress-card";
        card.innerHTML = `
            <h3>${w.dayName}</h3>
            <p><strong>Date:</strong> ${w.date}</p>
            <p><strong>Total Volume:</strong> ${w.volume} kg</p>
            <p><strong>Exercises:</strong> ${w.exercises.map(e => e.name).join(", ")}</p>
        `;
        historyEl.appendChild(card);
    });

    renderVolumeChart(canvas);
}

function renderVolumeChart(canvas) {
    if (typeof Chart === "undefined" || !canvas) return;

    const ctx = canvas.getContext("2d");
    const sorted = [...app.history].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );
    const labels = sorted.map(w => w.date);
    const data = sorted.map(w => w.volume);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Total Workout Volume (kg)",
                data,
                borderColor: "#007AFF",
                backgroundColor: "rgba(0,122,255,0.18)",
                fill: true,
                tension: 0.3,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
            animation: { duration: 800, easing: "easeOutQuart" }
        }
    });
}
