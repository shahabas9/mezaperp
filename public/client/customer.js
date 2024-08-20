document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('addButton');
    const formPopup = document.getElementById('formPopup');
    const closeButton = document.getElementById('closeButton');
    const customerForm = document.getElementById('customerForm');
    const customerTableBody = document.getElementById('customerTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchMobileInput = document.getElementById('searchMobile');
    const searchButtonMobile = document.getElementById('searchButtonMobile');
    const formTitle = document.getElementById('formTitle');
    const paginationContainer = document.getElementById('pagination');

    let editingCustomerId = null;
    let customers = []; // This should be filled with your customer data
    const recordsPerPage = 10;
    let currentPage = 1;

    addButton.addEventListener('click', () => {
        formPopup.style.display = 'block';
        formTitle.textContent = 'Add Customer';
        customerForm.reset();
        editingCustomerId = null;
    });

    closeButton.addEventListener('click', () => {
        formPopup.style.display = 'none';
    });

    customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(customerForm);
        const customerData = {
            customer_name: formData.get('customer_name'),
            mobile_no: formData.get('mobile_no'),
            email: formData.get('email')
        };

        let url = '/add-customer';
        let method = 'POST';

        if (editingCustomerId) {
            url = `/edit-customer/${editingCustomerId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        if (response.ok) {
            const newCustomer = await response.json();
            if (editingCustomerId) {
                updateCustomerInTable(newCustomer);
            } else {
                addCustomerToTable(newCustomer);
            }

            formPopup.style.display = 'none';
            customerForm.reset();
        } else {
            // Handle errors if needed
            alert('An error occurred while saving the customer data.');
        }
    });

    function addCustomerToTable(customer) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', customer.customer_id);
        row.innerHTML = `
            <td>${customer.customer_id}</td>
            <td>${customer.customer_name}</td>
            <td>${customer.mobile_no}</td>
            <td>${customer.email}</td>
            <td class="action-buttons">
                <button class="btn edit-button">Edit</button>
                <button class="btn delete-button">Delete</button>
            </td>
        `;
        customerTableBody.appendChild(row);

        row.querySelector('.edit-button').addEventListener('click', () => editCustomer(customer));
        row.querySelector('.delete-button').addEventListener('click', () => deleteCustomer(customer.customer_id));
    }

    function updateCustomerInTable(customer) {
        const row = document.querySelector(`tr[data-id='${customer.customer_id}']`);
        row.innerHTML = `
            <td>${customer.customer_id}</td>
            <td>${customer.customer_name}</td>
            <td>${customer.mobile_no}</td>
            <td>${customer.email}</td>
            <td class="action-buttons">
                <button class="btn edit-button">Edit</button>
                <button class="btn delete-button">Delete</button>
            </td>
        `;

        row.querySelector('.edit-button').addEventListener('click', () => editCustomer(customer));
        row.querySelector('.delete-button').addEventListener('click', () => deleteCustomer(customer.customer_id));
    }

    function editCustomer(customer) {
        formPopup.style.display = 'block';
        formTitle.textContent = 'Edit Customer';
        document.getElementById('customer_name').value = customer.customer_name;
        document.getElementById('mobile_no').value = customer.mobile_no;
        document.getElementById('email').value = customer.email;
        editingCustomerId = customer.customer_id;
    }

    async function deleteCustomer(customerId) {
        const response = await fetch(`/delete-customer/${customerId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            const row = document.querySelector(`tr[data-id='${customerId}']`);
            row.remove();
        } else {
            // Handle errors if needed
            alert('An error occurred while deleting the customer.');
        }
    }

    async function fetchCustomers(query = '', searchBy = 'customer_name') {
        console.log('Fetching customers with query:', query, 'and searchBy:', searchBy); // Debugging line
        let url = '/customers';
        if (query) {
            url += `?search=${encodeURIComponent(query)}&searchBy=${encodeURIComponent(searchBy)}`;
        }
    
        const response = await fetch(url);
        customers = await response.json();
    
        // Sort customers in descending order of customer_id
        customers.sort((a, b) => b.customer_id - a.customer_id);
    
        renderTable(currentPage);
        renderPagination();
    }
    

    function renderTable(page) {
        // Clear existing table data
        customerTableBody.innerHTML = '';
    
        // Calculate the start and end indices for the records to be displayed
        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const paginatedCustomers = customers.slice(start, end);
    
        // Render the table rows
        paginatedCustomers.forEach(customer => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', customer.customer_id);
            row.innerHTML = `
                <td>${customer.customer_id}</td>
                <td>${customer.customer_name}</td>
                <td>${customer.mobile_no}</td>
                <td>${customer.email}</td>
                <td class="action-buttons">
                    <button class="btn edit-button">Edit</button>
                    <button class="btn delete-button">Delete</button>
                </td>
            `;
            customerTableBody.appendChild(row);
    
            row.querySelector('.edit-button').addEventListener('click', () => editCustomer(customer));
            row.querySelector('.delete-button').addEventListener('click', () => deleteCustomer(customer.customer_id));
        });
    }

    function renderPagination() {
        // Clear existing pagination buttons
        paginationContainer.innerHTML = '';
    
        // Calculate total pages
        const totalPages = Math.ceil(customers.length / recordsPerPage);
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

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        fetchCustomers(query,'customer_name');
    });
    searchButtonMobile.addEventListener('click', () => {
        const query = searchMobileInput.value.trim();
        fetchCustomers(query, 'mobile_no'); // 'mobile' indicates searching by mobile number
    });

    // Trigger search when "Enter" key is pressed in the search input (customer name)
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = searchInput.value.trim();
            fetchCustomers(query, 'customer_name');
        }
    });

    // Trigger search when "Enter" key is pressed in the search mobile input (mobile number)
    searchMobileInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = searchMobileInput.value.trim();
            fetchCustomers(query, 'mobile_no');
        }
    });

    fetchCustomers();
});


function goBack() {
    window.history.back();
}

