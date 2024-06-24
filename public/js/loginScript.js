// Functie pentru validarea email-ului
        function validateEmail(email) {
            const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
            return re.test(String(email).toLowerCase());
        }

        // Adauga un event listener pentru formularul de inregistrare
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault(); // Previne comportamentul default al formularului
            // Colecteaza datele introduse de utilizator
            const email = document.getElementById('signupEmail').value;
            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;

            // Valideaza email-ul
            if (!validateEmail(email)) {
                alert('Invalid email format');
                return;
            }

            // Trimite o cerere POST catre server pentru a crea un nou utilizator
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password })
            });

            // Proceseaza raspunsul primit de la server
            const data = await response.json();
            if (data.id) {
                alert('Account created successfully'); // Contul a fost creat cu succes
                document.getElementById('signupEmail').value = '';
                document.getElementById('signupUsername').value = '';
                document.getElementById('signupPassword').value = '';
            } else {
                alert('Error creating account'); // A aparut o eroare la crearea contului
            }
        });

        // Adauga un event listener pentru butonul de login
        document.getElementById('loginButton').addEventListener('click', async () => {
            // Colecteaza datele introduse de utilizator
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            // Trimite o cerere POST catre server pentru a autentifica utilizatorul
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            // Proceseaza raspunsul primit de la server
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token); // Salveaza tokenul in local storage
                //verificam daca e admin sau user
                if (data.isAdmin == 1) {
                    window.location.href = "/html/admin.html"; // Redirectioneaza utilizatorul catre pagina de admin
                } else {
                    window.location.href = "/html/page1.html"; // Redirectioneaza utilizatorul catre pagina principala
                }
            } else {
                alert('Invalid credentials'); // Credentialele sunt invalide
            }
        });

        // Verifica daca utilizatorul este autentificat la incarcarea paginii
        window.onload = async () => {
            const token = localStorage.getItem('token'); // Recupereaza tokenul din local storage
            if (token) {
                // Trimite o cerere GET catre server pentru a verifica daca tokenul este valid
                const response = await fetch('/api/protected', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Daca raspunsul este OK, redirectioneaza utilizatorul catre pagina principala sau de admin in functie de rol

                if (response.ok) {
                    const data = await response.json();
                    if (data.isAdmin == 1) {
                        window.location.href = "/html/admin.html";
                    } else {
                        window.location.href = "/html/page1.html";
                    }
                }
            }
        };