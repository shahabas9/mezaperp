document.addEventListener('DOMContentLoaded', async () => {
    const projectTableBody = document.getElementById('projectTableBody');
    const projectForm = document.getElementById('projectForm');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const paginationContainer = document.getElementById('pagination');

    let products = []; // Use 'products' consistently
    const recordsPerPage = 10;
    let currentPage = 1;

    async function fetchProducts(query = '') {
        let url = '/products';
        if (query) {
            url += `?search=${encodeURIComponent(query)}`;
        }

        const response = await fetch(url);
        products = await response.json();

        renderTable(currentPage);
        renderPagination();
    }

    function renderTable(page) {
        projectTableBody.innerHTML = '';

        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const paginatedProducts = products.slice(start, end);

        paginatedProducts.forEach(product => {
            appendProjectRow(product);
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(products.length / recordsPerPage);
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

    async function deleteProduct(productId) {
        const response = await fetch(`/delete-product/${productId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Project deleted successfully.');
            fetchProducts(); // Refresh the projects list
        } else {
            alert('An error occurred while deleting the project.');
        }
    }

    async function saveProduct(productData, method, url) {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (response.ok) {
            alert('Project details saved successfully.');
            projectForm.reset();
            projectForm.classList.remove('show');
            fetchProducts(); // Refresh the projects list
        } else {
            alert('An error occurred while saving project details.');
        }
    }

    addProjectBtn.addEventListener('click', () => {
        projectForm.reset();
        projectForm.removeAttribute('data-product-id');
        projectForm.classList.add('show');
    });

    closeFormBtn.addEventListener('click', () => {
        projectForm.classList.remove('show');
        projectForm.reset();
        projectForm.removeAttribute('data-product-id');
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
        const productId = projectForm.getAttribute('data-product-id'); // Correctly fetching product ID from form

        console.log("Submitting form with Product ID:", productId); // Debugging

        const productData = {
            product_name: formData.get('product_name'),
            model: formData.get('model'),
            capacity: formData.get('capacity'),
        };

        let url, method;
        if (productId) {
            url = `/edit-product/${productId}`;  // Adding product ID in URL for PUT request
            method = 'PUT';
        } else {
            url = '/add-product';  // No product ID for POST request
            method = 'POST';
        }

        saveProduct(productData, method, url);
    });

    // Form submission for deleting projects
    projectTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const productId = e.target.dataset.productId;
            console.log('Deleting product with ID:', productId);
            const confirmDelete = confirm('Are you sure you want to delete this product details data?');
            if (confirmDelete) {
                deleteProduct(productId);
            }
        } else if (e.target.classList.contains('edit-btn')) {
            // Edit button clicked, show the project form with pre-filled data
            const productId = e.target.dataset.productId;
            console.log("Edit button clicked, Product ID:", productId);  // Debugging
    
            try {
                const product = await fetch(`/products/${productId}`).then(response => response.json());
                console.log("Fetched product data:", product);  // Log the product data received from the API
                
                if (product && product.product_id) {
                    fillFormForEdit(product); // Only call fillFormForEdit if product data is valid
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
        let quotationId = document.getElementById('searchInput').value.trim();
        const customerName = document.getElementById('searchName').value.trim();

        let query = '';
        if (quotationId !== '') {
            quotationId = quotationId.replace(/\s+/g, '').toUpperCase();
            if (quotationId.startsWith('QT')) {
                quotationId = 'QT ' + quotationId.substring(2).padStart(3, '0');
            } else {
                quotationId = 'QT ' + quotationId.padStart(3, '0');
            }
            query = `/projects?quotation_id=${encodeURIComponent(quotationId)}`;
        } else if (customerName !== '') {
            query = `/projects?customer_name=${encodeURIComponent(customerName)}`;
        } else {
            await fetchProducts();
            return;
        }

        const products = await fetch(query).then(response => response.json());
        projectTableBody.innerHTML = '';
        products.forEach(product => {
            appendProjectRow(product);
        });
    }

    function fillFormForEdit(product) {
        console.log("Editing Product ID:", product.product_id);  // Log product ID
        document.getElementById('product_name').value = product.product_name;
        document.getElementById('model').value = product.model;
        document.getElementById('capacity').value = product.capacity;

        projectForm.setAttribute('data-product-id', product.product_id);  // Set product ID to form
        projectForm.classList.add('show');
    }

    function appendProjectRow(product) {
        console.log('Product:', product);
        const row = document.createElement('tr');
        row.id = `projectRow_${product.product_id}`;

        row.innerHTML = `
            <td>${product.product_name}</td>
            <td>${product.model}</td>
            <td>${product.capacity}</td>
            <td>
                <button class="edit-btn" data-product-id="${product.product_id}">Edit</button>
                <button class="delete-btn" data-product-id="${product.product_id}">Delete</button>
            </td>
        `;
        projectTableBody.appendChild(row);
    }

    function updateProjectRow(product) {
        const row = document.getElementById(`projectRow_${product.product_id}`);
        row.innerHTML = `
            <td>${product.product_name}</td>
            <td>${product.model}</td>
            <td>${product.capacity}</td>
            <td>
                <button class="edit-btn" data-product-id="${product.product_id}">Edit</button>
                <button class="delete-btn" data-product-id="${product.product_id}">Delete</button>
            </td>
        `;
    }

    // Fetch the products initially
    fetchProducts();
});
 

function goBack() {
    window.history.back();
}




