function hideSidebar() {
    document.querySelector('.sidebar').style.display = 'none';
}

function showSidebar() {
    document.querySelector('.sidebar').style.display = 'block';
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const applyFiltersButton = document.getElementById("applyFiltersButton");

    applyFiltersButton.addEventListener("click", () => {
        const filters = [];
        if (document.getElementById("additives").checked) filters.push("additives");
        if (document.getElementById("allergens").checked) filters.push("allergens");

        console.log('Filters applied:', filters);
        filterProducts(filters);
    });

    async function searchProducts() {
        const query = searchInput.value;
        if (!query) return;

        const url = `/api/foods/search/${encodeURIComponent(query)}`;
        console.log(`Search URL: ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const results = await response.json();
            console.log('Search results:', results);

            const produseContainer = document.getElementById('produseContainer');
            produseContainer.innerHTML = ''; // Golește containerul existent

            if (results.length === 0) {
                const noResultsMessage = document.createElement('p');
                noResultsMessage.textContent = 'No products found';
                produseContainer.appendChild(noResultsMessage);
                return;
            }

            results.forEach(food => {
                const foodDiv = document.createElement('div');
                foodDiv.className = 'mancare';
                foodDiv.style.backgroundImage = `url(${food.image_url})`;
                foodDiv.dataset.id = food.code;
                foodDiv.addEventListener('click', () => showProductDetails(food.code));
                produseContainer.appendChild(foodDiv);
            });
        } catch (error) {
            console.error(`Error fetching search results: ${error}`);
            const produseContainer = document.getElementById('produseContainer');
            produseContainer.innerHTML = ''; // Golește containerul existent
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'An error occurred while fetching search results.';
            produseContainer.appendChild(errorMessage);
        }
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchProducts();
            }
        });
    } else {
        console.error("Element with id 'searchInput' not found.");
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var dropdowns = document.querySelectorAll('.dropdown-content.stop-propagation');
    dropdowns.forEach(function (dropdown) {
        dropdown.addEventListener('click', function (event) {
            event.stopPropagation();
        });
    });

   
    document.getElementById('selectAllButton').addEventListener('click', function () {
        showAllProducts();
    });

    fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
            console.log('Categories:', data); 
            const dropdownContent = document.getElementById('categories-dropdown');
            dropdownContent.innerHTML = '';
            data.forEach(category => {
                const a = document.createElement('a');
                a.href = "#";
                a.textContent = category.categories_en;
                a.addEventListener('click', function (event) {
                    event.preventDefault();
                    filterProductsByCategory(category.categories_en);
                });
                dropdownContent.appendChild(a);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));

    fetch('/api/countries')
        .then(response => response.json())
        .then(data => {
            console.log('Countries:', data); 
            const dropdownContent = document.getElementById('countries-dropdown');
            dropdownContent.innerHTML = ''; 
            data.forEach(country => {
                const a = document.createElement('a');
                a.href = "#";
                a.textContent = country;
                a.addEventListener('click', function (event) {
                    event.preventDefault();
                    filterProductsByCountry(country);
                });
                dropdownContent.appendChild(a);
            });
        })
        .catch(error => console.error('Error fetching countries:', error));

    fetch('/api/restaurants')
        .then(response => response.json())
        .then(data => {
            console.log('Restaurants:', data); 
            const dropdownContent = document.getElementById('restaurants-dropdown');
            dropdownContent.innerHTML = ''; 
            data.forEach(restaurant => {
                const a = document.createElement('a');
                a.href = "#";
                a.textContent = restaurant;
                a.addEventListener('click', function (event) {
                    event.preventDefault();
                    filterProductsByRestaurant(restaurant);
                });
                dropdownContent.appendChild(a);
            });
        })
        .catch(error => console.error('Error fetching restaurants:', error));

   
        document.getElementById('applyPriceButton').addEventListener('click', function () {
            var minPrice = parseFloat(document.querySelector('#priceMin').value);
            var maxPrice = parseFloat(document.querySelector('#priceMax').value);
    
            if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice <= maxPrice) {
                console.log(`Selected price range: ${minPrice} - ${maxPrice}`);
                filterProductsByPriceRange(minPrice, maxPrice);
            } else {
                console.error('Invalid price range');
            }
        });
    });

    document.getElementById('applyCalButton').addEventListener('click', function () {
        var minCal = parseFloat(document.querySelector('#calMin').value);
        var maxCal = parseFloat(document.querySelector('#calMax').value);

        if (!isNaN(minCal) && !isNaN(maxCal) && minCal <= maxCal) {
            console.log(`Selected price range: ${minCal} - ${maxCal}`);
            filterProductsByCalRange(minCal, maxCal);
        } else {
            console.error('Invalid price range');
        }
    });


function showAllProducts() {
    console.log('Showing all products');
    fetch('/api/foods')
        .then(response => {
            if (!response.ok) {
                console.error(`Network response was not ok: ${response.statusText}`);
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('All foods:', data); 
            const produseContainer = document.getElementById('produseContainer');
            produseContainer.innerHTML = ''; 
            data.forEach(food => {
                const foodDiv = document.createElement('div');
                foodDiv.className = 'mancare';
                foodDiv.style.backgroundImage = `url(${food.image_url})`;
                foodDiv.dataset.id = food.code;
                foodDiv.addEventListener('click', () => showProductDetails(food.code));
                produseContainer.appendChild(foodDiv);
            });
        })
        .catch(error => console.error('Error fetching all foods:', error));
}

function filterProductsByCategory(category) {
    console.log('Selected category:', category); 
    fetch(`/api/foods/category/${encodeURIComponent(category)}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Network response was not ok: ${response.statusText}`); 
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Filtered foods:', data); 
            const produseContainer = document.getElementById('produseContainer');
            produseContainer.innerHTML = ''; 
            data.forEach(food => {
                const foodDiv = document.createElement('div');
                foodDiv.className = 'mancare';
                foodDiv.style.backgroundImage = `url(${food.image_url})`;
                foodDiv.dataset.id = food.code;
                foodDiv.addEventListener('click', () => showProductDetails(food.code));
                produseContainer.appendChild(foodDiv);
            });
        })
        .catch(error => console.error('Error fetching foods:', error));
}

function filterProductsByCountry(country) {
    console.log('Selected country:', country); 
    fetch(`/api/foods/country/${encodeURIComponent(country)}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Network response was not ok: ${response.statusText}`); 
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Filtered foods:', data); 
            const produseContainer = document.getElementById('produseContainer');
            produseContainer.innerHTML = ''; 
            data.forEach(food => {
                const foodDiv = document.createElement('div');
                foodDiv.className = 'mancare';
                foodDiv.style.backgroundImage = `url(${food.image_url})`;
                foodDiv.dataset.id = food.code;
                foodDiv.addEventListener('click', () => showProductDetails(food.code));
                produseContainer.appendChild(foodDiv);
            });
        })
        .catch(error => console.error('Error fetching foods:', error));
}

function filterProductsByRestaurant(restaurant) {
    console.log('Selected restaurant:', restaurant);
    fetch(`/api/foods/restaurant/${encodeURIComponent(restaurant)}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Network response was not ok: ${response.statusText}`); 
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Filtered foods:', data); 
            const produseContainer = document.getElementById('produseContainer');
            produseContainer.innerHTML = ''; 
            data.forEach(food => {
                const foodDiv = document.createElement('div');
                foodDiv.className = 'mancare';
                foodDiv.style.backgroundImage = `url(${food.image_url})`;
                foodDiv.dataset.id = food.code;
                foodDiv.addEventListener('click', () => showProductDetails(food.code));
                produseContainer.appendChild(foodDiv);
            });
        })
        .catch(error => console.error('Error fetching foods:', error));
}

async function filterProductsByPriceRange(minPrice, maxPrice) {
    console.log(`Fetching products with price range: ${minPrice} - ${maxPrice}`);
    const url = `/api/foods/price?min=${minPrice}&max=${maxPrice}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const results = await response.json();
        console.log('Filtered foods:', results);

        const produseContainer = document.getElementById('produseContainer');
        produseContainer.innerHTML = ''; 

        if (results.length === 0) {
            const noResultsMessage = document.createElement('p');
            noResultsMessage.textContent = 'No products found in this price range';
            produseContainer.appendChild(noResultsMessage);
            return;
        }

        results.forEach(food => {
            const foodDiv = document.createElement('div');
            foodDiv.className = 'mancare';
            foodDiv.style.backgroundImage = `url(${food.image_url})`;
            foodDiv.dataset.id = food.code;
            foodDiv.addEventListener('click', () => showProductDetails(food.code));
            produseContainer.appendChild(foodDiv);
        });
    } catch (error) {
        console.error(`Error fetching foods: ${error}`);
        const produseContainer = document.getElementById('produseContainer');
        produseContainer.innerHTML = '';
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'An error occurred while fetching foods.';
        produseContainer.appendChild(errorMessage);
    }
}
function filterProductsByCalRange(min, max) {
    console.log(`Fetching products with cal range: ${min} - ${max}`);
    fetch(`/api/foods/calories?min=${min}&max=${max}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Network response was not ok: ${response.statusText}`); 
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Filtered foods:', data);
            const produseContainer = document.getElementById('produseContainer');
            produseContainer.innerHTML = '';
            
            if (data.length === 0) {
                const noResultsMessage = document.createElement('p');
                noResultsMessage.textContent = 'No products found in this calorie range';
                produseContainer.appendChild(noResultsMessage);
                return;
            }
            
            data.forEach(food => {
                const foodDiv = document.createElement('div');
                foodDiv.className = 'mancare';
                foodDiv.style.backgroundImage = `url(${food.image_url})`;
                foodDiv.dataset.id = food.code;
                foodDiv.addEventListener('click', () => showProductDetails(food.code));
                produseContainer.appendChild(foodDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching foods:', error);
            const produseContainer = document.getElementById('produseContainer');
            produseContainer.innerHTML = ''; 
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'An error occurred while fetching foods.';
            produseContainer.appendChild(errorMessage);
        });
}


document.querySelectorAll('.categorii .dropdown button').forEach(button => {
    button.addEventListener('click', function () {
        var dropdownContent = this.nextElementSibling;

        
        document.querySelectorAll('.dropdown-content').forEach(content => {
            if (content !== dropdownContent) {
                content.classList.remove('show');
            }
        });

        
        if (dropdownContent) {
            dropdownContent.classList.toggle('show');
        } else {
           
        }

        adjustProduseContainer();
    });
});

function adjustProduseContainer() {
    var produseContainer = document.getElementById('produseContainer');
    var dropdowns = document.querySelectorAll('.dropdown-content');
    var totalHeight = 0;

    dropdowns.forEach(dropdown => {
        if (dropdown.classList.contains('show')) {
            totalHeight += dropdown.scrollHeight;
        }
    });

    var originalHeight = window.innerHeight * 0.55;
    var originalTop = window.innerHeight * 0.45;

    produseContainer.style.marginTop = totalHeight + 'px';
    produseContainer.style.height = `calc(${originalHeight}px - ${totalHeight}px)`;
}


window.onclick = function (event) {
    if (!event.target.matches('.categorii .dropdown button')) {
        var dropdowns = document.querySelectorAll('.dropdown-content');
        var isAdjusted = false;
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
                isAdjusted = true;
            }
        });
        if (isAdjusted) {
            adjustProduseContainer();
        }
    }
};

window.onload = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const authResponse = await fetch('/api/protected', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!authResponse.ok) {
        window.location.href = '/login';
        return;
    }

    const foodResponse = await fetch('/api/foods', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (foodResponse.ok) {
        const foods = await foodResponse.json();
        const produseContainer = document.getElementById('produseContainer');
        foods.forEach(food => {
            const foodDiv = document.createElement('div');
            foodDiv.className = 'mancare';
            foodDiv.style.backgroundImage = `url(${food.image_url})`;
            foodDiv.dataset.id = food.code;
            foodDiv.addEventListener('click', () => showProductDetails(food.code));
            produseContainer.appendChild(foodDiv);
        });
    }
};

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
                <button onclick="addToCart('${product.code}')">Add</button>
                <div class="dropdown">
                    <button type="button" onclick="populateList('${product.code}')">Add to...</button>
                    <div class="dropdown-content" id="lists-dropdown">
                        <!-- Listele vor fi populate aici -->
                    </div>
                </div>
            </div>
        `;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

       
        populateList(product.code);
    }
}

async function populateList(foodCode) {
    console.log("Populating list with foodCode:", foodCode);  
    const token = localStorage.getItem('token');
    const response = await fetch('/api/lists', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const lists = await response.json();
        const dropdownContent = document.getElementById('lists-dropdown');
        dropdownContent.innerHTML = '';
        lists.forEach(list => {
            const a = document.createElement('a');
            a.href = "#";
            a.textContent = list.list_name;
            a.addEventListener('click', function (event) {
                event.preventDefault();
                addToUserList(list.id, foodCode);
            });
            dropdownContent.appendChild(a);
        });

      
        dropdownContent.classList.toggle('show');
    } else {
        console.error('Failed to load user lists');
    }
}

async function addToUserList(listId, foodCode) {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user-lists', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ listId, foodCode })
    });

    if (response.ok) {
        const result = await response.json();
        if (result.message === 'Food already exists in the list') {
            alert('This product is already in the list.');
        } else if (result.message === 'Food added to list successfully') {
            alert('Product added to the list successfully');
        }
    } else {
        const errorData = await response.json();
        alert(`Failed to add product to the list: ${errorData.error}`);
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

async function addToCart(productCode) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    console.log('Adding to cart', { userId, productCode });

    const response = await fetch('/api/user/food-preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, productCode: productCode })
    });

    if (response.ok) {
        alert('Food added to preferences');
    } else {
        const errorData = await response.json();
        if (response.status === 409) {
            alert('Food preference already exists');
        } else {
            alert(`Failed to add food to preferences: ${errorData.error}`);
        }
    }
    closePopup();
}



document.getElementById('applyFiltersButton').addEventListener('click', () => {
    const filters = [];
    if (document.getElementById('additives').checked) filters.push('additives');
    if (document.getElementById('allergens').checked) filters.push('allergens');

    filterProducts(filters);
});

async function filterProducts(filters) {
    const url = `/api/foods/filter`;
    console.log(`Filter URL: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filters })  
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const results = await response.json();
        console.log('Filter results:', results);

        const produseContainer = document.getElementById('produseContainer');
        produseContainer.innerHTML = ''; 

        results.forEach(food => {
            const foodDiv = document.createElement('div');
            foodDiv.className = 'mancare';
            foodDiv.style.backgroundImage = `url(${food.image_url})`;
            foodDiv.dataset.id = food.code;
            foodDiv.addEventListener('click', () => showProductDetails(food.code));
            produseContainer.appendChild(foodDiv);
        });
    } catch (error) {
        console.error(`Error fetching filter results: ${error}`);
    }
}

const filterFoods = async () => {
    const filters = {
        additives_en: true,
        allergens: true
    };

    const response = await fetch('/api/foods/filter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filters })
    });

    const filteredFoods = await response.json();
    console.log(filteredFoods);
    
};

document.getElementById('signout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
});