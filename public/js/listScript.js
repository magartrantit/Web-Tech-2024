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
    }

    loadLists();
};

document.getElementById('signout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
});

function openPopup() {
    document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('list-popup').style.display = 'none';
}

async function createList() {
    const listName = document.getElementById('listName').value;
    if (!listName) {
        alert('Please enter a list name.');
        return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, listName })
    });

    if (response.ok) {
        const result = await response.json();
        alert(result.message); 
        closePopup();
        loadLists();
    } else {
        const errorData = await response.json();
        alert(`Failed to create list: ${errorData.error}`);
    }
}

async function loadLists() {
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
        const listsContainer = document.querySelector('.lists-container');
        listsContainer.innerHTML = '';

        lists.forEach(list => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.textContent = list.list_name;
            listItem.style.border = '1px solid #000';
            listItem.style.padding = '10px';
            listItem.style.margin = '10px 0';
            listItem.dataset.listId = list.id; 
            listItem.addEventListener('click', () => openListPopup(list.id));
            listsContainer.appendChild(listItem);
        });
    } else {
        console.error('Failed to load lists');
    }
}

async function openListPopup(listId) {
    console.log(`Opening list popup for list ID: ${listId}`); 
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        const { items, numProducts, totalPrice, allergens, additives } = data;

        console.log("Items received from backend:", items); 

        const listProducts = document.getElementById('list-products');
        if (!listProducts) {
            console.error('Element with ID "list-products" not found.');
            return;
        }
        listProducts.innerHTML = ''; 

        items.forEach(item => {
            const product = document.createElement('div');
            product.className = 'product-item';
            product.textContent = item.product_name; 
            listProducts.appendChild(product);
        });

        // Afișează statisticile
        const listStatistics = document.getElementById('list-statistics');
        if (listStatistics) {
            listStatistics.innerHTML = `
        <p>Număr produse: ${numProducts}</p>
        <p>Preț total: ${totalPrice ? totalPrice.toFixed(2) : '0.00'} RON</p>
        <p>Alergeni: ${allergens || 'Niciunul'}</p>
        <p>Aditivi: ${additives || 'Niciunul'}</p>
    `;
        }

        document.getElementById('list-popup').style.display = 'flex';
        console.log('Popup displayed'); 
    } else {
        console.error('Failed to load list items');
    }
}


function hideSidebar() {
    document.querySelector('.sidebar').style.display = 'none';
}

function showSidebar() {
    document.querySelector('.sidebar').style.display = 'flex';
}