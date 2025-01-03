const timerElement = document.querySelector('#timer');
if (timerElement) {
  timerElement.addEventListener('click', startTimer);
}

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
