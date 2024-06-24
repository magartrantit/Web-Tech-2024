
        function validateEmail(email) {
            const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
            return re.test(String(email).toLowerCase());
        }

      
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault(); 
           
            const email = document.getElementById('signupEmail').value;
            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;

       
            if (!validateEmail(email)) {
                alert('Invalid email format');
                return;
            }

           
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password })
            });

            const data = await response.json();
            if (data.id) {
                alert('Account created successfully'); 
                document.getElementById('signupEmail').value = '';
                document.getElementById('signupUsername').value = '';
                document.getElementById('signupPassword').value = '';
            } else {
                alert('Error creating account'); 
            }
        });

 
        document.getElementById('loginButton').addEventListener('click', async () => {
           
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

          
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

           
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token); 
               
                if (data.isAdmin == 1) {
                    window.location.href = "/html/admin.html"; 
                } else {
                    window.location.href = "/html/page1.html"; 
                }
            } else {
                alert('Invalid credentials'); 
            }
        });

      
        window.onload = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('/api/protected', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

            

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