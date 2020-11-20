let url = new URL(window.location.href);
let target = url.searchParams.get('target');
document.getElementById('target').innerText = target;

document.getElementById('log-in').addEventListener('click', () => {
  let email = document.getElementById('email').value;

  document.getElementById('email-label').innerText = email;

  document.getElementById('log-in-form').style.display = 'none';
  document.getElementById('member-section').style.display = 'block';
});

window.featureFlags = [
  'finished-feature',
];
