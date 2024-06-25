document.getElementById('exportCsvButton').addEventListener('click', function () {
    const token = localStorage.getItem('token');
    fetch('/api/export-csv', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'culinary_preferences.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => console.error('Error exporting preferences to CSV:', error));
});

document.getElementById('exportPdfButton').addEventListener('click', function () {
    const token = localStorage.getItem('token');
    fetch('/api/export-pdf', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'culinary_preferences.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => console.error('Error exporting preferences to PDF:', error));
});

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
        window.location.href = '/login';
    } else {
        const data = await response.json();
        const userId = data.user.id;
        localStorage.setItem('userId', userId);

        const username = data.user.username;
        document.getElementById('username').innerText = `Hello, ${username}`;

        const profileImageUrl = data.user.profile_image;
        if (profileImageUrl) {
            document.getElementById('profileImageDisplay').src = `/uploads/${profileImageUrl}`;
            document.getElementById('profileImageDisplay').style.display = 'block';
        }

        

        const preferencesResponse = await fetch(`/api/user/food-preferences/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (preferencesResponse.ok) {
            const preferences = await preferencesResponse.json();
            const preferinteContainer = document.querySelector('.preferinte');
            preferences.forEach(food => {
                const foodDiv = document.createElement('div');
                foodDiv.className = 'mancare';
                foodDiv.style.backgroundImage = `url(${food.image_url})`;
                foodDiv.dataset.id = food.code;
                foodDiv.addEventListener('click', () => showProductDetails(food.code));
                preferinteContainer.appendChild(foodDiv);
            });
        }
    }
};

document.getElementById('changePictureButton').addEventListener('click', () => {
    document.getElementById('profileImage').click();
});

document.getElementById('profileImage').addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
        const formData = new FormData();
        const userId = localStorage.getItem('userId');
        formData.append('userId', userId);
        formData.append('profileImage', e.target.files[0]);

        const response = await fetch('/api/uploadProfileImage', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            alert('Profile image uploaded successfully');
            document.getElementById('profileImageDisplay').src = `/uploads/${data.profileImage}`;
            document.getElementById('profileImageDisplay').style.display = 'block';
        } else {
            alert('Error uploading profile image');
        }
    }
});

document.getElementById('signout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
});

async function showProductDetails(productId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/foods/${productId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const product = await response.json();
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-content">
                <span class="close-btn" onclick="closePopup()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
                <h2>${product.product_name}</h2>
                <img src="${product.image_url}" alt="${product.product_name}" style="width:100%;height:auto;">
                <p><strong>Brands:</strong> ${product.brands}</p>
                <p><strong>Categories:</strong> ${product.categories_en}</p>
                <p><strong>Countries:</strong> ${product.countries_en}</p>
                <p><strong>Ingredients:</strong> ${product.ingredients_text}</p>
                <p><strong>Allergens:</strong> ${product.allergens}</p>
                <p><strong>Additives:</strong> ${product.additives_en}</p>
                <ul>
                    <li><strong>Energy:</strong> ${product.energy_kcal_100g} kcal</li>
                    <li><strong>Fat:</strong> ${product.fat_100g} g</li>
                    <li><strong>Saturated Fat:</strong> ${product.saturated_fat_100g} g</li>
                    <li><strong>Carbohydrates:</strong> ${product.carbohydrates_100g} g</li>
                    <li><strong>Sugars:</strong> ${product.sugars_100g} g</li>
                    <li><strong>Fiber:</strong> ${product.fiber_100g} g</li>
                    <li><strong>Proteins:</strong> ${product.proteins_100g} g</li>
                    <li><strong>Salt:</strong> ${product.salt_100g} g</li>
                    <li><strong>Sodium:</strong> ${product.sodium_100g} g</li>
                </ul>
                <p><strong>Restaurants:</strong> ${product.restaurants}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                
            </div>
        `;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }
}

function closePopup() {
    const overlay = document.querySelector('.overlay');
    const popup = document.querySelector('.popup');
    if (overlay && popup) {
        popup.classList.add('popup-hide');
        popup.addEventListener('animationend', () => {
            document.body.removeChild(overlay);
        }, { once: true });
    }
}