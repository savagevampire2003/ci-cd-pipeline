// Authentication State Management
const AuthState = {
  user: null,
  isAuthenticated: false,

  setUser(user) {
    this.user = user;
    this.isAuthenticated = !!user;
    if (user) {
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('isAuthenticated');
    }
  },

  clearUser() {
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem('isAuthenticated');
  },

  checkSession() {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
};

// Form Validation
function validateLoginForm() {
  clearErrors();
  let isValid = true;

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username) {
    showError('loginUsernameError', 'Username is required');
    isValid = false;
  }

  if (!password) {
    showError('loginPasswordError', 'Password is required');
    isValid = false;
  }

  return isValid;
}

function validateRegistrationForm() {
  clearErrors();
  let isValid = true;

  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const fullName = document.getElementById('regFullName').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (!username) {
    showError('regUsernameError', 'Username is required');
    isValid = false;
  } else if (username.length < 3) {
    showError('regUsernameError', 'Username must be at least 3 characters');
    isValid = false;
  }

  if (!email) {
    showError('regEmailError', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError('regEmailError', 'Please enter a valid email address');
    isValid = false;
  }

  if (!fullName) {
    showError('regFullNameError', 'Full name is required');
    isValid = false;
  }

  if (!password) {
    showError('regPasswordError', 'Password is required');
    isValid = false;
  } else if (password.length < 6) {
    showError('regPasswordError', 'Password must be at least 6 characters');
    isValid = false;
  }

  if (!confirmPassword) {
    showError('regConfirmPasswordError', 'Please confirm your password');
    isValid = false;
  } else if (password !== confirmPassword) {
    showError('regConfirmPasswordError', 'Passwords do not match');
    isValid = false;
  }

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function clearErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  const successElements = document.querySelectorAll('.success-message');
  successElements.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

// UI Toggle Functions
function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registrationForm').style.display = 'none';
  clearErrors();
  document.getElementById('loginFormElement').reset();
}

function showRegistration() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registrationForm').style.display = 'block';
  clearErrors();
  document.getElementById('registrationFormElement').reset();
}

// Login Handler
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateLoginForm()) {
    return;
  }

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      AuthState.setUser(data.user);
      window.location.href = '/';
    } else {
      showError('loginError', data.error || 'Invalid username or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('loginError', 'An error occurred. Please try again.');
  }
});

// Registration Handler
document.getElementById('registrationFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateRegistrationForm()) {
    return;
  }

  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const fullName = document.getElementById('regFullName').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, fullName, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      const successElement = document.getElementById('registrationSuccess');
      successElement.textContent = 'Registration successful! Redirecting to login...';
      successElement.style.display = 'block';

      document.getElementById('registrationFormElement').reset();

      setTimeout(() => {
        showLogin();
        document.getElementById('loginUsername').value = username;
      }, 1500);
    } else {
      showError('registrationError', data.error || 'Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showError('registrationError', 'An error occurred. Please try again.');
  }
});

// Auto-login check on page load
window.addEventListener('DOMContentLoaded', async () => {
  // If user has a session, try to verify it
  if (AuthState.checkSession()) {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        AuthState.setUser(data.user);
        window.location.href = '/';
      } else {
        AuthState.clearUser();
      }
    } catch (error) {
      console.error('Session check error:', error);
      AuthState.clearUser();
    }
  }
});
