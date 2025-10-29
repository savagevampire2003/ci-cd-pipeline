let editingStudentId = null;

async function fetchStudents() {
  try {
    const res = await fetch('/api/students');
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
          <span>${escapeHtml(s.phone)}</span>
        </div>
        <div class="student-detail">
          <i class="fas fa-map-marker-alt"></i>
          <span>${escapeHtml(s.address)}</span>
        </div>
      </div>
      <div class="student-actions">
        <button class="btn btn-edit" onclick="editStudent('${s._id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-delete" onclick="deleteStudent('${s._id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function editStudent(id) {
  try {
    const res = await fetch(`/api/students/${id}`);
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
}

async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;
  
  try {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchStudents();
    } else {
      alert('Error deleting student');
    }
  } catch (err) {
    alert('Error deleting student');
  }
}

document.getElementById('studentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
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
        body: JSON.stringify(data)
      });
    } else {
      res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    if (res.ok) {
      cancelEdit();
      fetchStudents();
    } else {
      const err = await res.json();
      alert(err.error || 'Error saving student');
    }
  } catch (err) {
    alert('Error saving student');
  }
});

document.getElementById('cancelBtn').addEventListener('click', cancelEdit);

// Initial load
fetchStudents();
