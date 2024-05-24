// Funcții pentru a arăta și a ascunde bara laterală
function showSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'flex';
}

function hideSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
}

let currentSlide = 0;

// Funcție pentru a schimba slide-urile
function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide'); // Selectează toate elementele cu clasa 'slide'
    const totalSlides = slides.length; // Numără totalul de slide-uri

    // Actualizează slide-ul curent în funcție de direcție
    currentSlide += direction;

    // Dacă slide-ul curent este unul din ultimele 9, resetează la primul slide
    if (currentSlide === totalSlides - 9 || currentSlide === totalSlides - 8 || currentSlide === totalSlides - 7 || currentSlide === totalSlides - 6 || currentSlide === totalSlides - 5 || currentSlide === totalSlides - 4 || currentSlide === totalSlides - 3 || currentSlide === totalSlides - 2 || currentSlide === totalSlides - 1) 
        currentSlide = 0;
    // Dacă slide-ul curent este mai mic decât 0, setează-l la ultimul set de 10 slide-uri
    else if (currentSlide < 0)  
        currentSlide = totalSlides - 10;

    // Calculează lățimea unui slide incluzând marginea
    const slideWidth = slides[0].offsetWidth + parseInt(window.getComputedStyle(slides[0]).marginRight);

    // Selectează container-ul slider-ului
    const slider = document.querySelector('.slider');

    // Aplică transformarea pentru a schimba slide-ul
    slider.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
}

// Funcție pentru delogare
function logout() {
    localStorage.removeItem('token'); // Elimină token-ul din localStorage
    window.location.href = '/login'; // Redirecționează utilizatorul la pagina de login
}

// Selectarea elementelor pentru lista de cumpărături
const listsContainer = document.querySelector('[data-lists]');
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteListButton = document.querySelector('[data-delete-list-button]');
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const listCountElement = document.querySelector('[data-list-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearTasksButton = document.querySelector('[data-clear-tasks-button]');

// Chei pentru stocarea în localStorage
const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';

// Inițializarea variabilelor pentru liste și lista selectată
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

// Adăugarea de evenimente pentru interacțiuni cu listele și task-urile
listsContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') { // Verifică dacă elementul click-uit este un 'li'
        selectedListId = e.target.dataset.listId; // Setează id-ul listei selectate
        saveAndRender(); // Salvează și randează schimbările
    }
});

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') { // Verifică dacă elementul click-uit este un 'input'
        const selectedList = lists.find(list => list.id === selectedListId); // Găsește lista selectată
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id); // Găsește task-ul selectat
        selectedTask.complete = e.target.checked; // Schimbă status-ul task-ului
        save(); // Salvează schimbările
        renderTasksCount(selectedList); // Actualizează numărul de task-uri incomplete
    }
});

clearTasksButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId); // Găsește lista selectată
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete); // Elimină task-urile complete
    saveAndRender(); // Salvează și randează schimbările
});

newListForm.addEventListener('submit', e => {
    e.preventDefault(); // Previne comportamentul implicit al formularului
    const listName = newListInput.value; // Preia valoarea input-ului
    if (listName === null || listName === '') return; // Verifică dacă input-ul este gol
    const list = createList(listName); // Creează o nouă listă
    newListInput.value = null; // Resetează input-ul
    lists.push(list); // Adaugă lista nouă la array-ul de liste
    saveAndRender(); // Salvează și randează schimbările
});

newTaskForm.addEventListener('submit', e => {
    e.preventDefault(); // Previne comportamentul implicit al formularului
    const taskName = newTaskInput.value; // Preia valoarea input-ului
    if (taskName === null || taskName === '') return; // Verifică dacă input-ul este gol
    const task = createTask(taskName); // Creează un nou task
    newTaskInput.value = null; // Resetează input-ul
    const selectedList = lists.find(list => list.id === selectedListId); // Găsește lista selectată
    selectedList.tasks.push(task); // Adaugă task-ul nou la lista selectată
    saveAndRender(); // Salvează și randează schimbările
});

// Funcție pentru a crea un nou task
function createTask(name) {
    return { id: Date.now().toString(), name: name, complete: false }; // Creează un nou task cu un id unic, nume și status complet
}

// Eveniment pentru a șterge lista selectată
deleteListButton.addEventListener('click', e => {
    lists = lists.filter(list => list.id !== selectedListId); // Elimină lista selectată din array-ul de liste
    selectedListId = null; // Resetează id-ul listei selectate
    saveAndRender(); // Salvează și randează schimbările
});

// Funcție pentru a crea o nouă listă
function createList(name) {
    return { id: Date.now().toString(), name: name, tasks: [] }; // Creează o nouă listă cu un id unic, nume și array de task-uri
}

// Funcție pentru a salva și a randa schimbările
function saveAndRender() {
    save(); // Salvează listele și id-ul listei selectate în localStorage
    render(); // Randează listele și task-urile
}

// Funcție pentru a salva listele și id-ul listei selectate în localStorage
function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists)); // Salvează listele în localStorage
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId); // Salvează id-ul listei selectate în localStorage
}

// Funcție pentru a randa listele și task-urile
function render() {
    clearElement(listsContainer); // Curăță container-ul de liste
    renderLists(); // Randează listele

    const selectedList = lists.find(list => list.id === selectedListId); // Găsește lista selectată

    if (selectedListId === null) {
        listDisplayContainer.style.display = 'none'; // Ascunde container-ul de afișare a listei dacă nu este selectată nicio listă
    } else {
        listDisplayContainer.style.display = ''; // Arată container-ul de afișare a listei
        listTitleElement.innerText = selectedList.name; // Setează titlul listei
        renderTasksCount(selectedList); // Randează numărul de task-uri incomplete
        clearElement(tasksContainer); // Curăță container-ul de task-uri
        renderTasks(selectedList); // Randează task-urile listei selectate
    }
}

// Funcție pentru a randa task-urile unei liste selectate
function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true); // Clonează template-ul task-ului
        const checkbox = taskElement.querySelector('input'); // Selectează checkbox-ul din template
        checkbox.id = task.id; // Setează id-ul checkbox-ului
        checkbox.checked = task.complete; // Setează status-ul complet al checkbox-ului
        const label = taskElement.querySelector('label'); // Selectează eticheta din template
        label.htmlFor = task.id; // Setează atributul htmlFor pentru etichetă
        label.append(task.name); // Adaugă numele task-ului în etichetă
        tasksContainer.appendChild(taskElement); // Adaugă elementul task la container-ul de task-uri
    });
}

// Funcție pentru a randa numărul de task-uri incomplete
function renderTasksCount(selectedList) {
    const incompleteTasks = selectedList.tasks.filter(task => !task.complete).length; // Numără task-urile incomplete
    const taskString = incompleteTasks === 1 ? 'task' : 'tasks'; // Decide dacă folosește forma singulară sau plurală
    listCountElement.innerText = `${incompleteTasks} ${taskString} remaining`; // Setează textul pentru numărul de task-uri rămase
}

// Funcție pentru a randa listele
function renderLists() {
    lists.forEach(list => {
        const listElement = document.createElement('li'); // Creează un element 'li' pentru fiecare listă
        listElement.dataset.listId = list.id; // Setează atributul data-list-id pentru element
        listElement.classList.add('list-name'); // Adaugă clasa 'list-name'
        listElement.innerText = list.name; // Setează numele listei ca text al elementului
        if (list.id === selectedListId) listElement.classList.add('isactive-list'); // Adaugă clasa 'isactive-list' dacă lista este selectată
        listsContainer.appendChild(listElement); // Adaugă elementul la container-ul de liste
    });
}

// Funcție pentru a curăța elementele unui container
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild); // Elimină toate elementele copil din elementul dat
    }
}

// Randează lista și task-urile la încărcarea paginii
render();
