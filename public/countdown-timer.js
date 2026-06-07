'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const displays = document.querySelectorAll('.countdown-display');

  function updateTimers() {
    const now = new Date();

    displays.forEach(display => {
      const targetDateString = display.getAttribute('data-date');
      if (!targetDateString) return;

      const targetDate = new Date(targetDateString);
      const diffMs = (targetDate - now);

      if (diffMs <= 0) {
        display.textContent = '残り 0日 0時間 0分 0秒';
        display.style.color = '#ff0000';
        return;
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      display.textContent = `残り ${diffDays}日 ${diffHours}時間 ${diffMinutes}分 ${diffSeconds}秒`
    });
  }

  updateTimers();
  setInterval(updateTimers, 1000);
})