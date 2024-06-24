
window.onload = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
    }

    const response = await fetch('/api/protected', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        window.location.href = '/admin';
    }
}

function modifyDates() {
    document.getElementById("modifyUserPopup").style.display = "block";
}

function closeModifyUserPopup() {
    document.getElementById("modifyUserPopup").style.display = "none";
}

function submitModifyUser() {
    const userId = document.getElementById('userSelect').value;
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    // Verifică dacă s-au introdus date valide
    if (!userId || (!newUsername && !newPassword)) {
        alert('Please select a user and provide at least new username or password.');
        return;
    }

    const requestData = {};
    if (newUsername) requestData.username = newUsername;
    if (newPassword) requestData.password = newPassword;

    
    const token = localStorage.getItem('token');
    fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Includeți token-ul de autorizare
        },
        body: JSON.stringify(requestData), // Converteste obiectul requestData într-un șir JSON
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            window.alert('User modified successfully'); // Mesajul de succes
            fetchUsers();
            closeModifyUserPopup();
        })
        .catch(error => {
            console.error('Error updating user:', error);
            window.alert('Error updating user'); // Mesajul de eroare
        });
}

function addProduct() {
    document.getElementById("addProductPopup").style.display = "block";
}

function closePopup() {
    document.getElementById("addProductPopup").style.display = "none";
}

function closeErrorPopup() {
    document.getElementById("errorPopup").style.display = "none";
}

function submitProduct() {
    var form = document.getElementById("addProductForm");
    var fields = form.querySelectorAll('input[type="text"]');
    var allFieldsFilled = Array.from(fields).every(field => field.value.trim() !== "");

    if (!allFieldsFilled) {
        document.getElementById("errorPopup").style.display = "block";
        return;
    }

    var formData = new FormData(form);
    fetch('/api/products', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.ok) {
            closePopup();
            form.reset();
        } else {
            alert('Error submitting the product');
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    fetchUsers();
});

function fetchUsers() {
    const userSelect = document.getElementById('userSelect');
    userSelect.innerHTML = ''; // Curăță opțiunile existente

    fetch('/api/users')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched users:', data);
            data.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.username;
                userSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}
function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

async function deleteUser() {
    const userId = document.getElementById('userSelect').value;
    console.log('Deleting user with ID:', userId);
    const token = localStorage.getItem('token');

    fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            window.alert('User deleted successfully'); // Mesajul de succes
            setTimeout(() => location.reload(), 1000);
        } else {
            window.alert('Error deleting user'); // Mesajul de eroare
        }
    })
    .catch(error => console.error('Error deleting user:', error));
}

document.getElementById('signout').addEventListener('click', () => {
    // La click pe butonul de delogare, se elimină tokenul din stocarea locală
    localStorage.removeItem('token');
    // Și se redirecționează utilizatorul către pagina de autentificare
    window.location.href = '/login';
});

document.getElementById('signout1').addEventListener('click', () => {
    // La click pe butonul de delogare, se elimină tokenul din stocarea locală
    localStorage.removeItem('token');
    // Și se redirecționează utilizatorul către pagina de autentificare
    window.location.href = '/login';
});
