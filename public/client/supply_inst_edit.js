async function fetchSupplyData() {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');

    if (!quotationId) {
        console.error('Quotation ID is not provided');
        return;
    }

    console.log('Fetching supply data for quotationId:', quotationId);

    try {
        const response = await fetch(`/api/supply_inst_edit/${quotationId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data fetched:', data);
        populateForm(data);
    } catch (error) {
        console.error('Error fetching supply data:', error);
        alert('Failed to fetch supply data');
    }
}

function populateForm(data) {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    const customerIdSelect = document.getElementById('customer');
    const quotationIdSelect = document.getElementById('quotation');

    // Populate customer and quotation dropdowns
    customerIdSelect.innerHTML = `<option value="${data[0].customer_id}">${data[0].customer_id}</option>`;
    quotationIdSelect.innerHTML = `<option value="${data[0].quotation_id}">${data[0].quotation_id}</option>`;
    // Clear existing data
    tableBody.innerHTML = '';

    data.forEach(record => {
        addRow(null, record);
    });

    updateButtons();
}

window.onload = fetchSupplyData;

function updateButtons() {
    const rows = document.querySelectorAll('#supplyInstTable tbody tr');
    rows.forEach((row, index) => {
        const actionCell = row.querySelector('td:last-child');
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

function deleteRow(button) {
    const row = button.parentNode.parentNode;
    const table = row.parentNode;
    table.removeChild(row);
    updateButtons();
}

function addRow(button) {
    var table = document.getElementById("supplyInstTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    var cell5 = newRow.insertCell(4);
    var cell6 = newRow.insertCell(5);

    cell1.innerHTML = '<select name="Type[]" onchange="updateTonOptions(this)"><option value="ducted split units">Ducted Split Units</option><option value="wall mounted split units">Wall Mounted Split Units</option><option value="cassette">Cassette</option><option value="floor stand">Floor Stand</option><option value="package units">Package Units</option></select>';
    cell2.innerHTML = '<select name="TON[]"></select>';
    cell3.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';
    cell4.innerHTML = '<input type="number" name="Unit Price[]" oninput="updateTotal(this)">';
    cell5.innerHTML = '<input type="number" name="Total Price[]" readonly>';
    cell6.innerHTML = '<button type="button" onclick="addRow(this)">+</button> <button type="button" onclick="deleteRow(this)">-</button>';

    // Initialize TON options based on the default Type value
    updateTonOptions(newRow.querySelector('select[name="Type[]"]'));
    
    updateButtons();
}


function updateTonOptions(selectElement) {
    var tonSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="TON[]"]');
    var typeValue = selectElement.value;
    
    tonSelect.innerHTML = ''; // Clear existing options

    if (typeValue === 'ducted split units') {
        tonSelect.innerHTML = '<option value="1.5">1.5</option><option value="2.5">2.5</option><option value="2.75">2.75</option><option value="3">3</option><option value="4.26">4.26</option><option value="5">5</option><option value="6.66">6.66</option><option value="8.33">8.33</option>';
    } else if (typeValue === 'wall mounted split units') {
        tonSelect.innerHTML = '<option value="1">1</option><option value="1.5">1.5</option><option value="2">2</option><option value="2.5">2.5</option><option value="3">3</option>';
    } else if (typeValue === 'cassette') {
        tonSelect.innerHTML = '<option value="1.5">1.5</option><option value="2.5">2.5</option><option value="2.75">2.75</option><option value="3">3</option><option value="4">4</option><option value="4.25">4.25</option>';
    } else if (typeValue === 'floor stand') {
        tonSelect.innerHTML = '<option value="2.3">2.3</option><option value="3.25">3.25</option><option value="4">4</option><option value="4.35">4.35</option>';
    } else if (typeValue === 'package units') {
        tonSelect.innerHTML = '<option value="6.8">6.8</option><option value="9.1">9.1</option><option value="10">10</option><option value="13.65">13.65</option><option value="18.2">18.2</option><option value="20">20</option><option value="28.5">28.5</option>';
    }else {
        // Add default or other specific options based on type if necessary
        tonSelect.innerHTML = '<option value="Select TON">Select TON</option>';
    }
}

function initializeTonOptions() {
    var rows = document.querySelectorAll('#supplyInstTable tbody tr');
    rows.forEach(function(row, index) {
        var typeSelect = row.querySelector('select[name="Type[]"]');
        updateTonOptions(typeSelect);
    });
    updateButtons();
}

function updateTotal(element) {
    var row = element.parentNode.parentNode;
    var quantityInput = row.querySelector('input[name="Quantity[]"]');
    var priceInput = row.querySelector('input[name="Unit Price[]"]');
    var totalInput = row.querySelector('input[name="Total Price[]"]');
    
    var unitPrice = parseFloat(priceInput.value) || 0;
    var quantity = parseFloat(quantityInput.value) || 0;
    
    totalInput.value = (unitPrice * quantity); // Calculate and set the total tonnage
}

async function handleSubmit(event) {
    event.preventDefault();

    const customerId = document.getElementById('customer').value;
    const quotationId = document.getElementById('quotation').value;
    const tableRows = document.querySelectorAll('#supplyInstTable tbody tr');

    const supplyData = [];

    tableRows.forEach((row, index) => {
        const typeElement = row.querySelector('select[name="Type[]"]');
        const tonElement = row.querySelector('select[name="TON[]"]');
        const quantityElement = row.querySelector('input[name="Quantity[]"]');
        const unitPriceElement = row.querySelector('input[name="Unit Price[]"]');
        const totalPriceElement = row.querySelector('input[name="Total Price[]"]');

        // Log elements to debug
        console.log(`Row ${index}:`, {
            typeElement,
            tonElement,
            quantityElement,
            unitPriceElement,
            totalPriceElement
        });

        // Ensure all elements are found before accessing their values
        if (typeElement && tonElement && quantityElement && unitPriceElement && totalPriceElement) {
            supplyData.push({
                type: typeElement.value,
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
        quotation_id: quotationId,
        customer_id: customerId,
        supply_data: supplyData
    };

    console.log('Submitting payload:', payload);

    try {
        const response = await fetch('/api/savesupplyinst', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        alert('Data submitted successfully');
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit data');
    }
}



function generateNewQuotationId(quotationId) {
    const parts = quotationId.split('_');
    if (parts.length === 1) {
        return `${quotationId}_RV1`;
    } else {
        const revision = parseInt(parts[1].replace('RV', ''), 10) + 1;
        return `${parts[0]}_RV${revision}`;
    }
}

initializeTonOptions();
updateButtons();