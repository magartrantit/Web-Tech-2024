// Funcții pentru a arăta și a ascunde bara laterală
function showSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'flex';
}

function hideSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
}



// Funcție pentru delogare
function logout() {
    localStorage.removeItem('token'); // Elimină token-ul din localStorage
    window.location.href = '/login'; // Redirecționează utilizatorul la pagina de login
}

