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

let editingStudentId = null;
let currentTab = 'home';

// Check authentication on page load
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      AuthState.setUser(data.user);
      initializeApp();
    } else {
      AuthState.clearUser();
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Auth check error:', error);
    AuthState.clearUser();
    window.location.href = '/login.html';
  }
}

// Initialize the application after authentication
function initializeApp() {
  document.getElementById('navbar').style.display = 'flex';
  document.getElementById('navUsername').textContent = AuthState.user.username;
  document.getElementById('welcomeUsername').textContent = AuthState.user.fullName || AuthState.user.username;

  loadProfile();
  fetchStudents();
  updateDashboardStats();
}

// Tab Navigation
function switchTab(tabName) {
  currentTab = tabName;

  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });

  // Remove active class from all nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tabName + 'Tab').style.display = 'block';

  // Add active class to selected nav tab
  document.querySelector(`.nav-tab[data-tab="${tabName}"]`).classList.add('active');

  // Load data for specific tabs
  if (tabName === 'students') {
    fetchStudents();
  } else if (tabName === 'profile') {
    loadProfile();
  } else if (tabName === 'home') {
    updateDashboardStats();
  }
}

// Logout function
async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  AuthState.clearUser();
  window.location.href = '/login.html';
}

// Profile Management
async function loadProfile() {
  if (!AuthState.user) return;

  document.getElementById('profileUsername').textContent = AuthState.user.username;
  document.getElementById('profileEmail').textContent = AuthState.user.email;
  document.getElementById('profileFullName').textContent = AuthState.user.fullName;

  if (AuthState.user.createdAt) {
    const date = new Date(AuthState.user.createdAt);
    document.getElementById('profileCreatedAt').textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

function showProfileEdit() {
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('profileEdit').style.display = 'block';

  document.getElementById('profileEditEmail').value = AuthState.user.email;
  document.getElementById('profileEditFullName').value = AuthState.user.fullName;

  clearProfileErrors();
}

function cancelProfileEdit() {
  document.getElementById('profileView').style.display = 'block';
  document.getElementById('profileEdit').style.display = 'none';
  clearProfileErrors();
}

function clearProfileErrors() {
  document.getElementById('profileEmailError').textContent = '';
  document.getElementById('profileEmailError').style.display = 'none';
  document.getElementById('profileFullNameError').textContent = '';
  document.getElementById('profileFullNameError').style.display = 'none';
  document.getElementById('profileUpdateError').textContent = '';
  document.getElementById('profileUpdateError').style.display = 'none';
  document.getElementById('profileUpdateSuccess').textContent = '';
  document.getElementById('profileUpdateSuccess').style.display = 'none';
}

// Profile form submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearProfileErrors();

  const email = document.getElementById('profileEditEmail').value.trim();
  const fullName = document.getElementById('profileEditFullName').value.trim();

  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, fullName }),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      AuthState.setUser(data.user);
      loadProfile();

      const successElement = document.getElementById('profileUpdateSuccess');
      successElement.textContent = 'Profile updated successfully!';
      successElement.style.display = 'block';

      setTimeout(() => {
        cancelProfileEdit();
      }, 1500);
    } else {
      const errorElement = document.getElementById('profileUpdateError');
      errorElement.textContent = data.error || 'Failed to update profile';
      errorElement.style.display = 'block';
    }
  } catch (error) {
    console.error('Profile update error:', error);
    const errorElement = document.getElementById('profileUpdateError');
    errorElement.textContent = 'An error occurred. Please try again.';
    errorElement.style.display = 'block';
  }
});

// Dashboard Stats
async function updateDashboardStats() {
  try {
    const res = await fetch('/api/students', {
      credentials: 'include'
    });
    const students = await res.json();

    document.getElementById('totalStudents').textContent = students.length;

    // Calculate students added this month
    const now = new Date();
    const thisMonth = students.filter(s => {
      const createdDate = new Date(s.createdAt);
      return createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear();
    });

    document.getElementById('recentStudents').textContent = thisMonth.length;
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  }
}

async function fetchStudents() {
  try {
    const res = await fetch('/api/students', {
      credentials: 'include'
    });

    if (res.status === 401) {
      AuthState.clearUser();
      window.location.href = '/login.html';
      return;
    }

    const students = await res.json();
    renderStudents(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    document.getElementById('studentsContainer').innerHTML =
      '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading students</p></div>';
  }
}

function renderStudents(students) {
  const container = document.getElementById('studentsContainer');

  if (students.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No students found. Add your first student above!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = students.map(s => `
    <div class="student-card" data-id="${s._id}">
      <div class="student-header">
        <div class="student-name">${escapeHtml(s.name)}</div>
        <div class="student-reg">${escapeHtml(s.registrationNumber)}</div>
      </div>
      <div class="student-details">
        <div class="student-detail">
          <i class="fas fa-envelope"></i>
          <span>${escapeHtml(s.email)}</span>
        </div>
        <div class="student-detail">
          <i class="fas fa-phone"></i>
          <span>${formatPhone(s.phone)}</span>
        </div>
        <div class="student-detail">
          <i class="fas fa-map-marker-alt"></i>
          <span>${escapeHtml(s.address)}</span>
        </div>
        ${s.createdAt ? `
        <div class="student-detail">
          <i class="fas fa-calendar"></i>
          <span>Added: ${formatDate(s.createdAt)}</span>
        </div>
        ` : ''}
      </div>
      <div class="student-actions">
        <button class="btn btn-edit" onclick="editStudent('${s._id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-delete" onclick="deleteStudent('${s._id}', '${escapeHtml(s.name)}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Format date consistently
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format phone number consistently
function formatPhone(phone) {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 11 && cleaned.startsWith('92')) {
    // Pakistani format: +92 300 1234567
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US with country code: +1 (123) 456-7890
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return original if format not recognized
  return escapeHtml(phone);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function editStudent(id) {
  try {
    const res = await fetch(`/api/students/${id}`, {
      credentials: 'include'
    });
    const student = await res.json();

    document.getElementById('name').value = student.name;
    document.getElementById('registrationNumber').value = student.registrationNumber;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone;
    document.getElementById('address').value = student.address;
    document.getElementById('editingId').value = id;

    document.getElementById('submitBtnText').textContent = 'Update Student';
    document.getElementById('cancelBtn').style.display = 'inline-flex';

    editingStudentId = id;

    // Scroll to form
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Error loading student details');
  }
}

function cancelEdit() {
  document.getElementById('studentForm').reset();
  document.getElementById('editingId').value = '';
  document.getElementById('submitBtnText').textContent = 'Add Student';
  document.getElementById('cancelBtn').style.display = 'none';
  editingStudentId = null;
  clearFormErrors();
}

function clearFormErrors() {
  document.getElementById('nameError').textContent = '';
  document.getElementById('nameError').style.display = 'none';
  document.getElementById('registrationNumberError').textContent = '';
  document.getElementById('registrationNumberError').style.display = 'none';
  document.getElementById('emailError').textContent = '';
  document.getElementById('emailError').style.display = 'none';
  document.getElementById('phoneError').textContent = '';
  document.getElementById('phoneError').style.display = 'none';
  document.getElementById('addressError').textContent = '';
  document.getElementById('addressError').style.display = 'none';
  document.getElementById('formError').textContent = '';
  document.getElementById('formError').style.display = 'none';
}

function displayFormErrors(errors) {
  clearFormErrors();

  if (errors.name) {
    const errorElement = document.getElementById('nameError');
    errorElement.textContent = errors.name;
    errorElement.style.display = 'block';
  }
  if (errors.registrationNumber) {
    const errorElement = document.getElementById('registrationNumberError');
    errorElement.textContent = errors.registrationNumber;
    errorElement.style.display = 'block';
  }
  if (errors.email) {
    const errorElement = document.getElementById('emailError');
    errorElement.textContent = errors.email;
    errorElement.style.display = 'block';
  }
  if (errors.phone) {
    const errorElement = document.getElementById('phoneError');
    errorElement.textContent = errors.phone;
    errorElement.style.display = 'block';
  }
  if (errors.address) {
    const errorElement = document.getElementById('addressError');
    errorElement.textContent = errors.address;
    errorElement.style.display = 'block';
  }
}

async function deleteStudent(id, studentName) {
  // Enhanced confirmation dialog
  const confirmMessage = `Are you sure you want to delete the student "${studentName}"?\n\nThis action cannot be undone.`;

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      // If we're editing this student, cancel the edit
      if (editingStudentId === id) {
        cancelEdit();
      }
      fetchStudents();
      updateDashboardStats();
    } else {
      const data = await res.json();
      alert(data.error || 'Error deleting student');
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('Error deleting student. Please try again.');
  }
}

document.getElementById('studentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors();

  const data = {
    name: document.getElementById('name').value.trim(),
    registrationNumber: document.getElementById('registrationNumber').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim()
  };

  try {
    let res;
    if (editingStudentId) {
      res = await fetch(`/api/students/${editingStudentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    } else {
      res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    }

    if (res.ok) {
      cancelEdit();
      fetchStudents();
      updateDashboardStats();
    } else {
      const responseData = await res.json();

      // Handle field-specific errors
      if (responseData.errors) {
        displayFormErrors(responseData.errors);
      } else if (responseData.error) {
        // Handle general error
        const errorElement = document.getElementById('formError');
        errorElement.textContent = responseData.error;
        errorElement.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Form submission error:', err);
    const errorElement = document.getElementById('formError');
    errorElement.textContent = 'Error saving student. Please try again.';
    errorElement.style.display = 'block';
  }
});

document.getElementById('cancelBtn').addEventListener('click', cancelEdit);

// Initial load - check authentication first
checkAuth();
