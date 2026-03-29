// ============================================================
//  AUTH.JS — Role-based login system
// ============================================================

const USERS = {
  'admin':  { password: 'admin123', role: 'admin',     label: 'Administrator',  avatar: 'A' },
  'qa':     { password: 'qa123',    role: 'qa',        label: 'QA Engineer',    avatar: 'Q' },
  'dev':    { password: 'dev123',   role: 'developer', label: 'Developer',      avatar: 'D' }
};

// Role permissions
const PERMISSIONS = {
  admin:     ['checklist', 'admin', 'history', 'submit', 'export', 'delete'],
  qa:        ['checklist', 'history', 'submit', 'export'],
  developer: ['checklist', 'history']
};

let currentUser = null;
let selectedLoginRole = 'admin';

function selectRole(role) {
  selectedLoginRole = role;
  document.querySelectorAll('.role-pill').forEach(p => p.classList.remove('active'));
  document.getElementById('role-' + role).classList.add('active');
}

function doLogin() {
  const username = document.getElementById('login-user').value.trim().toLowerCase();
  const password = document.getElementById('login-pass').value;
  const errEl    = document.getElementById('login-error');

  if (!username || !password) {
    errEl.textContent = 'Please enter username and password.';
    return;
  }

  const user = USERS[username];
  if (!user || user.password !== password) {
    errEl.textContent = 'Invalid username or password.';
    shakeLoginCard();
    return;
  }

  // Role check
  if (user.role !== selectedLoginRole && !(selectedLoginRole === 'admin' && user.role === 'admin')) {
    if (username !== selectedLoginRole && !(username === 'admin' && selectedLoginRole === 'admin')
      && !(username === 'qa' && selectedLoginRole === 'qa')
      && !(username === 'dev' && selectedLoginRole === 'developer')) {
      errEl.textContent = 'Username does not match selected role.';
      shakeLoginCard();
      return;
    }
  }

  currentUser = { username, ...user };
  errEl.textContent = '';

  // Update UI
  document.getElementById('user-avatar').textContent = user.avatar;
  document.getElementById('user-name').textContent   = username.charAt(0).toUpperCase() + username.slice(1);
  document.getElementById('user-role').textContent   = user.label;

  // Hide admin nav if not admin
  if (user.role !== 'admin') {
    const adminNav = document.getElementById('nav-admin');
    if (adminNav) adminNav.style.display = 'none';
  }

  // Animate login screen out
  const loginScreen = document.getElementById('login-screen');
  loginScreen.style.opacity = '0';
  loginScreen.style.transform = 'scale(1.05)';
  loginScreen.style.transition = 'all 0.4s ease';

  setTimeout(() => {
    loginScreen.style.display = 'none';
    document.getElementById('app').style.display = 'grid';
    initApp();
  }, 400);
}

function doLogout() {
  currentUser = null;
  document.getElementById('app').style.display = 'none';
  const loginScreen = document.getElementById('login-screen');
  loginScreen.style.display = 'flex';
  loginScreen.style.opacity = '0';
  loginScreen.style.transform = 'scale(0.95)';
  setTimeout(() => {
    loginScreen.style.opacity = '1';
    loginScreen.style.transform = 'scale(1)';
    loginScreen.style.transition = 'all 0.4s ease';
  }, 50);
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

function shakeLoginCard() {
  const card = document.querySelector('.login-card');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'shake 0.4s ease';
}

// Add shake keyframes dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

// Allow Enter key to login
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') {
    doLogin();
  }
});

function hasPermission(perm) {
  if (!currentUser) return false;
  return PERMISSIONS[currentUser.role]?.includes(perm);
}
