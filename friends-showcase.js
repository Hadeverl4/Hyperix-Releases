/* Interactive, client-only showcase: no accounts, network calls or friend requests. */
(() => {
  'use strict';
  const root = document.getElementById('friends-mock');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll('[data-friends-tab]'));
  const rows = Array.from(root.querySelectorAll('.friends-mock-row'));
  const feedback = root.querySelector('#friends-mock-feedback');
  const play = root.querySelector('#friends-mock-play');
  const add = root.querySelector('#friends-mock-add');
  const addPane = root.querySelector('#friends-mock-add-pane');
  let pulseTimer;
  const tx = (en, vi) => document.documentElement.lang === 'vi' ? vi : en;
  function notice() { feedback.textContent = tx('Interactive preview — no real invitations are sent.', 'Đây là bản xem thử, không gửi lời mời thật.'); }
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    root.querySelectorAll('.friends-mock-pane').forEach(pane => { pane.hidden = pane.id !== (tab.dataset.friendsTab === 'time' ? 'friends-preview-time' : 'friends-preview-list'); });
  }));
  rows.forEach(row => row.addEventListener('click', () => {
    rows.forEach(item => item.setAttribute('aria-pressed', String(item === row)));
    feedback.textContent = tx('Selected ' + row.querySelector('strong').textContent + ' · preview only.', 'Đã chọn ' + row.querySelector('strong').textContent + ' · chỉ xem thử.');
  }));
  add.addEventListener('click', () => { addPane.hidden = !addPane.hidden; if (!addPane.hidden) addPane.querySelector('input').focus(); });
  addPane.querySelector('button').addEventListener('click', () => {
    feedback.textContent = tx('Friend requests are unavailable in this demo.', 'Bản xem thử không gửi yêu cầu kết bạn.');
    addPane.hidden = true;
  });
  play.addEventListener('click', () => {
    clearTimeout(pulseTimer);
    play.classList.remove('is-pulsing');
    void play.offsetWidth;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) play.classList.add('is-pulsing');
    notice();
    pulseTimer = window.setTimeout(() => play.classList.remove('is-pulsing'), 850);
  });
  document.querySelectorAll('.lang-btn').forEach(button => button.addEventListener('click', () => window.setTimeout(notice, 0)));
})();
