document.addEventListener("DOMContentLoaded", () => {
    const timerElement = document.getElementById("timer");
    if (timerElement) {
        timerElement.addEventListener("click", () => {
            console.log("Timer clicked");
        });
    }
});

export const startTimer = (callback, duration) => {
  let timer = duration;
  const interval = setInterval(() => {
    timer -= 1;
    if (timer <= 0) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 1000);
};
