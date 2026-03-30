const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('auth-form');
  const btnAnon = document.getElementById('btn-anonymous');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const roleContainer = document.getElementById('role-container');
  const submitBtn = document.getElementById('submit-auth');
  const errorBox = document.getElementById('auth-error');

  let mode = 'login'; // or register

  tabLogin.addEventListener('click', () => {
    mode = 'login';
    tabLogin.classList.add('btn-accent');
    tabLogin.style.background = '';
    tabLogin.style.color = 'white';

    tabRegister.classList.remove('btn-accent');
    tabRegister.style.background = 'rgba(255,255,255,0.4)';
    tabRegister.style.color = 'var(--text-dark)';

    submitBtn.innerText = 'Sign In';
    errorBox.innerText = '';
  });

  tabRegister.addEventListener('click', () => {
    mode = 'register';
    tabRegister.classList.add('btn-accent');
    tabRegister.style.background = '';
    tabRegister.style.color = 'white';

    tabLogin.classList.remove('btn-accent');
    tabLogin.style.background = 'rgba(255,255,255,0.4)';
    tabLogin.style.color = 'var(--text-dark)';

    submitBtn.innerText = 'Create Account';
    errorBox.innerText = '';
  });

  btnAnon.addEventListener('click', () => {
    let anonymousId = localStorage.getItem('mindspace_anon_id');
    if (!anonymousId) {
      anonymousId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('mindspace_anon_id', anonymousId);
    }
    window.location.href = 'home.html';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.error) {
        errorBox.innerText = data.error;
      } else if (data.success) {
        if (data.user.role === 'admin') {
          errorBox.innerHTML = 'Admins must use the <a href="admin-login.html">Admin Portal</a>.';
          return;
        }

        // Store explicit user
        localStorage.setItem('mindspace_user', JSON.stringify(data.user));
        // Overwrite anon_id to match this user to prevent creating new dupes
        localStorage.setItem('mindspace_anon_id', data.user.anonymousId);

        window.location.href = 'home.html';
      }
    } catch (error) {
      errorBox.innerText = 'Network error. Try again.';
    }
  });

  // Check if user is already logged in as regular user
  const curUser = JSON.parse(localStorage.getItem('mindspace_user') || 'null');
  if (curUser && curUser.role !== 'admin' && window.location.pathname.includes('login') && !window.location.pathname.includes('admin-login')) {
      window.location.href = 'home.html';
  }
});
