document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('addButton');
    const formPopup = document.getElementById('formPopup');
    const closeButton = document.getElementById('closeButton');
    const customerForm = document.getElementById('customerForm');
    const customerTableBody = document.getElementById('customerTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const formTitle = document.getElementById('formTitle');

    let editingCustomerId = null;

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
            if (editingCustomerId) {
                const updatedCustomer = await response.json();
                updateCustomerInTable(updatedCustomer);
            } else {
                const newCustomer = await response.json();
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

    async function fetchCustomers(query = '') {
        let url = '/customers';
        if (query) {
            url += `?search=${encodeURIComponent(query)}`;
        }

        const response = await fetch(url);
        const customers = await response.json();
        customerTableBody.innerHTML = '';
        customers.forEach(addCustomerToTable);
    }

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        fetchCustomers(query);
    });

    fetchCustomers();
});
