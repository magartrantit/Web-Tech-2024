
function showSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'flex';
}

function hideSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
}


function logout() {
    localStorage.removeItem('token'); 
    window.location.href = '/login'; 
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const menuLinks = document.querySelectorAll('.sidebar li a');

    menuLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            if (window.innerWidth <= 650) {
                event.preventDefault(); 
                
                    window.location.href = link.href; 
                
                hideSidebar(); 
            }
        });
    });

    
    window.showSidebar = function() {
        sidebar.style.display = 'flex'; 
    };

    window.hideSidebar = function() {
        sidebar.style.display = 'none'; 
    };
});