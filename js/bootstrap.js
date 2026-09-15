const status = document.createElement('p');
status.setAttribute('role', 'status');
status.textContent = 'Loading Copperfall…';
Object.assign(status.style, {
  position: 'fixed', inset: '40% 1rem auto', textAlign: 'center',
  color: '#e0def4', fontFamily: 'sans-serif', zIndex: '1000',
});
document.body.append(status);

import('./main.js').then(() => status.remove()).catch((error) => {
  status.textContent = 'Copperfall could not load. Reload the page to try again.';
  status.dataset.loadError = error.message;
  console.error('Copperfall startup failed:', error);
});
