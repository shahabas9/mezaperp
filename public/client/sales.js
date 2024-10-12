document.addEventListener('DOMContentLoaded', async () => {
    const projectTableBody = document.getElementById('projectTableBody');
    const projectForm = document.getElementById('projectForm');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const paginationContainer = document.getElementById('pagination');

    let sales = []; // Use 'products' consistently
    const recordsPerPage = 10;
    let currentPage = 1;

    async function fetchSales(query = '') {
        let url = '/sales';
        if (query) {
            url += `?search=${encodeURIComponent(query)}`;
        }

        const response = await fetch(url);
        sales = await response.json();

        renderTable(currentPage);
        renderPagination();
    }

    function renderTable(page) {
        projectTableBody.innerHTML = '';

        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const paginatedSales = sales.slice(start, end);

        paginatedSales.forEach(sales => {
            appendProjectRow(sales);
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(sales.length / recordsPerPage);
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

    async function deleteSales(salesId) {
        const response = await fetch(`/delete-sales/${salesId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Project deleted successfully.');
            fetchSales(); // Refresh the projects list
        } else {
            alert('An error occurred while deleting the project.');
        }
    }

    async function saveSales(salesData, method, url) {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(salesData)
        });
        if (response.ok) {
            alert('Project details saved successfully.');
            projectForm.reset();
            projectForm.classList.remove('show');
            fetchSales(); // Refresh the projects list
        } else {
            alert('An error occurred while saving project details.');
        }
    }

    addProjectBtn.addEventListener('click', () => {
        projectForm.reset();
        projectForm.removeAttribute('data-sales-id');
        projectForm.classList.add('show');
    });

    closeFormBtn.addEventListener('click', () => {
        projectForm.classList.remove('show');
        projectForm.reset();
        projectForm.removeAttribute('data-sales-id');
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
        const salesId = projectForm.getAttribute('data-sales-id'); // Correctly fetching product ID from form

        console.log("Submitting form with Sales ID:", salesId); // Debugging

        const salesData = {
            person_name: formData.get('person_name'),
            contact: formData.get('contact')
        };

        let url, method;
        if (salesId) {
            url = `/edit-sales/${salesId}`;  // Adding product ID in URL for PUT request
            method = 'PUT';
        } else {
            url = '/add-sales';  // No product ID for POST request
            method = 'POST';
        }

        saveSales(salesData, method, url);
    });

    // Form submission for deleting projects
    projectTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const salesId = e.target.dataset.salesId;
            console.log('Deleting product with ID:', salesId);
            const confirmDelete = confirm('Are you sure you want to delete this product details data?');
            if (confirmDelete) {
                deleteSales(salesId);
            }
        } else if (e.target.classList.contains('edit-btn')) {
            // Edit button clicked, show the project form with pre-filled data
            const salesId = e.target.dataset.salesId;
            console.log("Edit button clicked, Product ID:", salesId);  // Debugging
    
            try {
                const sales = await fetch(`/sales/${salesId}`).then(response => response.json());
                console.log("Fetched product data:", sales);  // Log the product data received from the API
                
                if (sales && sales.sales_id) {
                    fillFormForEdit(sales); // Only call fillFormForEdit if product data is valid
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
            query = `/sales?person_name=${encodeURIComponent(personName)}`;
        } else if (contact !== '') {
            query = `/sales?contact=${encodeURIComponent(contact)}`;
        } else {
            await fetchSales();
            return;
        }
    
        const sales = await fetch(query).then(response => response.json());
        projectTableBody.innerHTML = '';
        sales.forEach(sale => {
            appendProjectRow(sale);
        });
    }

    function fillFormForEdit(sales) {
        console.log("Editing Product ID:", sales.sales_id);  // Log product ID
        document.getElementById('person_name').value = sales.person_name;
        document.getElementById('contact').value = sales.contact;
        

        projectForm.setAttribute('data-sales-id', sales.sales_id);  // Set product ID to form
        projectForm.classList.add('show');
    }

    function appendProjectRow(sales) {
        console.log('Sales:', sales);
        const row = document.createElement('tr');
        row.id = `projectRow_${sales.sales_id}`;

        row.innerHTML = `
            <td>${sales.person_name}</td>
            <td>${sales.contact}</td>
           
            <td>
                <button class="edit-btn" data-sales-id="${sales.sales_id}">Edit</button>
                <button class="delete-btn" data-sales-id="${sales.sales_id}">Delete</button>
            </td>
        `;
        projectTableBody.appendChild(row);
    }

    function updateProjectRow(sales) {
        const row = document.getElementById(`projectRow_${sales.sales_id}`);
        row.innerHTML = `
            <td>${sales.person_name}</td>
            <td>${sales.contact}</td>
            
            <td>
                <button class="edit-btn" data-sales-id="${sales.sales_id}">Edit</button>
                <button class="delete-btn" data-sales-id="${sales.sales_id}">Delete</button>
            </td>
        `;
    }

    // Fetch the products initially
    fetchSales();
});
 

function goBack() {
    window.history.back();
}




