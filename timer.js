document.addEventListener("DOMContentLoaded", () => {
    const timerElement = document.getElementById("timer");
    if (timerElement) {
        timerElement.addEventListener("click", () => {
            console.log("Timer clicked");
        });
    } else {
        console.warn("Timer element not found on page load.");
    }
});
