// Global variable to store grouped products data
let groupedProductsData = {};

// Fetch products and initialize the first row
document.addEventListener('DOMContentLoaded', async () => {
    await fetchProducts();
    const firstRow = document.querySelector('#supplyTable tbody tr');
    await initializeRow(firstRow);
});

// Fetch products from the backend API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        groupedProductsData = groupProductsByName(products);
        populateProductDropdown();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Group products by product_name
function groupProductsByName(products) {
    const groupedProducts = {};

    products.forEach(product => {
        if (!groupedProducts[product.product_name]) {
            groupedProducts[product.product_name] = [];
        }
        groupedProducts[product.product_name].push({
            model: product.model,
            capacity: product.capacity
        });
    });

    return groupedProducts;
}

// Populate the product dropdown with unique product names
function populateProductDropdown() {
    const productSelects = document.querySelectorAll('select[name="Type[]"]');
    productSelects.forEach(productSelect => {
        productSelect.innerHTML = ''; // Clear existing options
        Object.keys(groupedProductsData).forEach(productName => {
            const option = document.createElement('option');
            option.value = productName;
            option.text = productName;
            productSelect.add(option);
        });

        // Optionally, select the first product by default and update models
        if (productSelect.options.length > 0) {
            productSelect.value = productSelect.options[0].value;
            updateModelOptions(productSelect);
        }
    });
}

// Initialize a row by populating its dropdowns
async function initializeRow(row) {
    const productSelect = row.querySelector('select[name="Type[]"]');
    if (productSelect.options.length === 0) {
        populateProductDropdown();
    }

    // Set model and capacity based on selected product
    updateModelOptions(productSelect);
}

// Update model options based on selected product
function updateModelOptions(selectElement) {
    const selectedProductName = selectElement.value;
    const selectedProducts = groupedProductsData[selectedProductName];

    const row = selectElement.closest('tr');
    const modelSelect = row.querySelector('select[name="Model Inoor/Outdoor[]"]');
    const tonSelect = row.querySelector('select[name="TON[]"]');

    // Clear the model and ton dropdowns
    modelSelect.innerHTML = '';
    tonSelect.innerHTML = '';

    // Populate the model dropdown with models
    selectedProducts.forEach(product => {
        const modelOption = document.createElement('option');
        modelOption.value = product.model;
        modelOption.text = product.model;
        modelOption.dataset.capacity = product.capacity; // Set capacity as data attribute
        modelSelect.add(modelOption);
    });

    // Populate the ton dropdown based on the first model
    if (modelSelect.options.length > 0) {
        const firstModelOption = modelSelect.options[0];
        const capacity = firstModelOption.dataset.capacity;
        tonSelect.innerHTML = `<option value="${capacity}">${capacity}</option>`;
    }

    // Add event listener for model select to update capacity
    modelSelect.addEventListener('change', function() {
        updateTonOptions(this);
    });
}

// Update ton (capacity) based on selected model
function updateTonOptions(selectElement) {
    const selectedModelOption = selectElement.options[selectElement.selectedIndex];
    const capacity = selectedModelOption.dataset.capacity;

    const tonSelect = selectElement.closest('tr').querySelector('select[name="TON[]"]');
    tonSelect.innerHTML = `<option value="${capacity}">${capacity}</option>`;
}

// Delete a row from the table
function deleteRow(button) {
    var row = button.parentNode.parentNode;
    var table = row.parentNode;
    table.removeChild(row);
    updateButtons();
}

// Add a new row to the table
function addRow(button) {
    var table = document.getElementById("supplyTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    var cell5 = newRow.insertCell(4);
    var cell6 = newRow.insertCell(5);
    var cell7 = newRow.insertCell(6);

    cell1.innerHTML = '<select name="Type[]" onchange="updateModelOptions(this)"></select>';
    cell2.innerHTML = '<select name="Model Inoor/Outdoor[]" onchange="updateTonOptions(this)"></select>';
    cell3.innerHTML = '<select name="TON[]"></select>';
    cell4.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';
    cell5.innerHTML = '<input type="number" name="Unit Price[]" oninput="updateTotal(this)">';
    cell6.innerHTML = '<input type="number" name="Total Price[]" readonly>';
    cell7.innerHTML = '<button type="button" onclick="addRow(this)">+</button> <button type="button" onclick="deleteRow(this)">-</button>';

    // Initialize the new row
    initializeRow(newRow);

    updateButtons();
}

// Update action buttons based on the number of rows
function updateButtons() {
    var rows = document.querySelectorAll('#supplyTable tbody tr');
    rows.forEach(function(row, index) {
        var actionCell = row.querySelector('td:last-child');
        actionCell.innerHTML = '';

        if (rows.length === 1) {
            actionCell.innerHTML = '<button type="button" onclick="addRow(this)">+</button>';
        } else if (index === 0) {
            actionCell.innerHTML = '<button type="button" onclick="addRow(this)">+</button>';
        } else if (index === rows.length - 1) {
            actionCell.innerHTML = '<button type="button" onclick="addRow(this)">+</button> <button type="button" onclick="deleteRow(this)">-</button>';
        } else {
            actionCell.innerHTML = '<button type="button" onclick="deleteRow(this)">-</button>';
        }
    });
}

// Update total price based on quantity and unit price
function updateTotal(element) {
    var row = element.parentNode.parentNode;
    var quantityInput = row.querySelector('input[name="Quantity[]"]');
    var priceInput = row.querySelector('input[name="Unit Price[]"]');
    var totalInput = row.querySelector('input[name="Total Price[]"]');
    
    var unitPrice = parseFloat(priceInput.value) || 0;
    var quantity = parseFloat(quantityInput.value) || 0;
    
    totalInput.value = (unitPrice * quantity).toFixed(2); // Calculate and set the total price
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    // Show confirmation dialog
    const confirmation = confirm("Are you sure you want to submit the supply data?");
    
    // If the user clicks "No" (Cancel), stop further execution
    if (!confirmation) {
        return;
    }

    const customerId = document.getElementById('customer').value;
    const quotationId = document.getElementById('quotation').value;
    const tableRows = document.querySelectorAll('#supplyTable tbody tr');

    const supplyData = [];

    tableRows.forEach((row, index) => {
        const typeElement = row.querySelector('select[name="Type[]"]');
        const modelElement = row.querySelector('select[name="Model Inoor/Outdoor[]"]');
        const tonElement = row.querySelector('select[name="TON[]"]');
        const quantityElement = row.querySelector('input[name="Quantity[]"]');
        const unitPriceElement = row.querySelector('input[name="Unit Price[]"]');
        const totalPriceElement = row.querySelector('input[name="Total Price[]"]');

        // Debugging output
        console.log(`Row ${index}:`, {
            typeElement: typeElement.value,
            modelElement: modelElement.value,
            tonElement: tonElement.value,
            quantityElement: quantityElement.value,
            unitPriceElement: unitPriceElement.value,
            totalPriceElement: totalPriceElement.value
        });

        // Ensure all elements are found before accessing their values
        if (typeElement && modelElement && tonElement && quantityElement && unitPriceElement && totalPriceElement) {
            supplyData.push({
                type: typeElement.value,
                model: modelElement.value,
                ton: tonElement.value,
                quantity: quantityElement.value,
                unit_price: unitPriceElement.value,
                total_price: totalPriceElement.value
            });
        } else {
            console.error(`Error: Missing elements in row ${index}`);
        }
    });

    const payload = {
        customer_id: customerId,
        quotation_id: quotationId,
        supply_data: supplyData
    };

    console.log('Submitting payload:', payload); // Debugging output

    try {
        const response = await fetch('/api/supply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        alert('Data submitted successfully');

        // Redirect to customer_project.html after successful submission
        window.location.href = 'customer_project.html';
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit data');
    }
}

// Initialize Select2 for customer dropdown
$(document).ready(function() {
    $('#customer').select2({
        placeholder: 'Search for a customer',
        allowClear: true
    });
  
    // Load the customer data and populate the dropdown
    initializeDataOptions();
});

// Fetch and populate the customer dropdown on page load
async function initializeDataOptions() {
    try {
        const response = await fetch('/api/customers');
        const customers = await response.json();
        console.log('Customers (Before Sorting):', customers);

        // Sort customers by customer_id in descending order
        customers.sort((a, b) => b.customer_id - a.customer_id);
        console.log('Customers (After Sorting):', customers);

        populateDropdown('customer', customers, 'customer_id', 'customer_name');

        const customerDropdown = $('#customer');

        // Trigger change event to populate the quotation dropdown
        if (customerDropdown.find('option').length > 0) {
            customerDropdown.val(customerDropdown.find('option:first').val()).trigger('change');
        }

        // Add event listener to the customer dropdown
        customerDropdown.on('change', updateQuotationDropdown);
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

// Update quotation dropdown based on selected customer
async function updateQuotationDropdown() {
    const customerId = this.value;
    try {
        const response = await fetch(`/api/quotations/${customerId}`);
        const quotations = await response.json();
        console.log('Quotations:', quotations);
    
        populateDropdown('quotation', quotations, 'quotation_id', 'quotation_id');
    } catch (error) {
        console.error('Error fetching quotations:', error);
    }
}
  
// Populate a dropdown with items
function populateDropdown(dropdownId, items, valueKey, textKey) {
    const dropdown = $(`#${dropdownId}`);
    dropdown.empty(); // Clear existing options
  
    items.forEach(item => {
        dropdown.append(new Option(item[textKey], item[valueKey]));
    });
  
    dropdown.trigger('change'); // Refresh the dropdown with Select2
}

// Filter customers based on search input
function filterCustomers() {
    const searchInput = document.getElementById('customerSearch');
    const filter = searchInput.value.toUpperCase();
    const dropdown = document.getElementById('customer');
    const options = dropdown.getElementsByTagName('option');

    for (let i = 0; i < options.length; i++) {
        const customerName = options[i].text.toUpperCase();
        if (customerName.includes(filter)) {
            options[i].style.display = '';
        } else {
            options[i].style.display = 'none';
        }
    }
}