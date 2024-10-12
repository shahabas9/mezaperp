document.addEventListener('DOMContentLoaded', async () => {
    const projectTableBody = document.getElementById('projectTableBody');
    const projectForm = document.getElementById('projectForm');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const paginationContainer = document.getElementById('pagination');

    let users = []; // Use 'products' consistently
    const recordsPerPage = 10;
    let currentPage = 1;

    async function fetchUsers(query = '') {
        let url = '/users';
        if (query) {
            url += `?search=${encodeURIComponent(query)}`;
        }
    
        const response = await fetch(url);
        users = await response.json();  // Update the global 'users' array
    
        console.log('Fetched users:', users);  // Log the fetched users
    
        renderTable(currentPage);  // Render the table after fetching data
        renderPagination();  // Update the pagination
    }
    
    

    function renderTable(page) {
        projectTableBody.innerHTML = '';

        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const paginatedUsers = users.slice(start, end);

        paginatedUsers.forEach(users => {
            appendProjectRow(users);
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(users.length / recordsPerPage);
        const maxPagesToShow = 5; // Maximum number of pages to show directly

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.classList.add('pagination-button');
            if (i === currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentPage = i;
                renderTable(currentPage);
                renderPagination();
            });
            paginationContainer.appendChild(button);
        }

        // Previous Button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.classList.add('pagination-button');
            prevButton.addEventListener('click', () => {
                currentPage--;
                renderTable(currentPage);
                renderPagination();
            });
            paginationContainer.insertBefore(prevButton, paginationContainer.firstChild);
        }

        // Next Button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.classList.add('pagination-button');
            nextButton.addEventListener('click', () => {
                currentPage++;
                renderTable(currentPage);
                renderPagination();
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    async function deleteUsers(usersId) {
        const response = await fetch(`/delete-users/${usersId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Project deleted successfully.');
            fetchUsers(); // Refresh the projects list
        } else {
            alert('An error occurred while deleting the project.');
        }
    }

    async function saveUsers(usersData, method, url) {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usersData)
        });
        if (response.ok) {
            alert('Project details saved successfully.');
            projectForm.reset();
            projectForm.classList.remove('show');
            fetchUsers(); // Refresh the projects list
        } else {
            alert('An error occurred while saving project details.');
        }
    }

    addProjectBtn.addEventListener('click', () => {
        projectForm.reset();
        projectForm.removeAttribute('data-users-id');
        projectForm.classList.add('show');
    });

    closeFormBtn.addEventListener('click', () => {
        projectForm.classList.remove('show');
        projectForm.reset();
        projectForm.removeAttribute('data-users-id');
    });

    // Form submission for adding/editing projects
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const confirmation = confirm("Are you sure you want to submit the project details?");
        if (!confirmation) {
            projectForm.classList.remove('show');
            return;
        }

        const formData = new FormData(projectForm);
        const usersId = projectForm.getAttribute('data-users-id'); // Correctly fetching product ID from form

        console.log("Submitting form with Users ID:", usersId); // Debugging

        const usersData = {
            person_name: formData.get('person_name'),
            password: formData.get('password'),
            email: formData.get('email'),
            role: formData.get('role')
        };

        let url, method;
        if (usersId) {
            url = `/edit-users/${usersId}`;  // Adding product ID in URL for PUT request
            method = 'PUT';
        } else {
            url = '/add-users';  // No product ID for POST request
            method = 'POST';
        }

        saveUsers(usersData, method, url);
    });

    // Form submission for deleting projects
    projectTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const usersId = e.target.dataset.usersId;
            console.log('Deleting product with ID:', usersId);
            const confirmDelete = confirm('Are you sure you want to delete this product details data?');
            if (confirmDelete) {
                deleteUsers(usersId);
            }
        } else if (e.target.classList.contains('edit-btn')) {
            // Edit button clicked, show the project form with pre-filled data
            const usersId = e.target.dataset.usersId;
            console.log("Edit button clicked, Product ID:", usersId);  // Debugging
    
            try {
                const users = await fetch(`/users/${usersId}`).then(response => response.json());
                console.log("Fetched product data:", users);  // Log the product data received from the API
                
                if (users && users.id) {
                    fillFormForEdit(users); // Only call fillFormForEdit if product data is valid
                } else {
                    console.error('Product data is invalid or missing product_id');
                }
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        }
    });

    // Search functionality
    searchBtn.addEventListener('click', async () => {
        await performSearch();
    });
    
    const inputFields = [document.getElementById('searchInput'), document.getElementById('searchName')];
    inputFields.forEach(inputField => {
        inputField.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                await performSearch();
            }
        });
    });
    
    async function performSearch() {
        let personName = document.getElementById('searchInput').value.trim();
        const contact = document.getElementById('searchName').value.trim();
    
        let query = '';
        if (personName !== '') {
            personName = personName.replace(/\s+/g, '').toUpperCase();
            query = `/users?person_name=${encodeURIComponent(personName)}`;
        } else if (contact !== '') {
            query = `/users?contact=${encodeURIComponent(contact)}`;
        } else {
            await fetchUsers();
            return;
        }
    
        const users = await fetch(query).then(response => response.json());
        projectTableBody.innerHTML = '';
        users.forEach(user => {
            appendProjectRow(user);
        });
    }

    function fillFormForEdit(users) {
        console.log("Editing Product ID:", users.id);  // Log product ID
        document.getElementById('person_name').value = users.username;
        document.getElementById('password').value = users.password;
        document.getElementById('email').value = users.email;
        document.getElementById('role').value = users.role;


        projectForm.setAttribute('data-users-id', users.id);  // Set product ID to form
        projectForm.classList.add('show');
    }

    function appendProjectRow(users) {
        console.log('Users:', users);
        const row = document.createElement('tr');
        row.id = `projectRow_${users.id}`;

        row.innerHTML = `
            <td>${users.username}</td>
            <td>${users.password}</td>
            <td>${users.email}</td>
            <td>${users.role}</td>
            <td>
                <button class="edit-btn" data-users-id="${users.id}">Edit</button>
                <button class="delete-btn" data-users-id="${users.id}">Delete</button>
            </td>
        `;
        projectTableBody.appendChild(row);
    }

    function updateProjectRow(users) {
        const row = document.getElementById(`projectRow_${users.id}`);
        row.innerHTML = `
            <td>${users.person_name}</td>
            <td>${users.password}</td>
            <td>${users.email}</td>
            <td>${users.role}</td>
            <td>
                <button class="edit-btn" data-users-id="${users.id}">Edit</button>
                <button class="delete-btn" data-users-id="${users.id}">Delete</button>
            </td>
        `;
    }

    // Fetch the products initially
    fetchUsers();
});
 

function goBack() {
    window.history.back();
}

