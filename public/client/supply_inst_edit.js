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
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const modelSelect = row.querySelector('select[name="Type[]"]');
        const tonSelect = row.querySelector('select[name="TON[]"]');
        
        if (modelSelect && tonSelect) {
            updateTonOptions(modelSelect, tonSelect.value);
        }
    });

    updateButtons();
}

window.onload = fetchSupplyData;

function updateButtons() {
    const rows = document.querySelectorAll('#supplyInstTable tbody tr');
    rows.forEach((row) => {
        const actionCell = row.querySelector('td:last-child');
        actionCell.innerHTML = `
            <button type="button" onclick="addRow(this)">+</button>
            <button type="button" onclick="deleteRow(this)">-</button>
        `;
    });
}

function deleteRow(button) {
    const row = button.parentNode.parentNode;
    const table = row.parentNode;
    table.removeChild(row);
    updateButtons();
}

function addRow(button, record = {}) {
    const table = document.getElementById("supplyInstTable").getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(button ? button.parentNode.parentNode.rowIndex : table.rows.length);

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);
    const cell6 = newRow.insertCell(5);
    const cell7 = newRow.insertCell(6);

    const typeOptions = `
        <option value="ducted split units">Ducted Split Units</option>
        <option value="wall mounted split units">Wall Mounted Split Units</option>
        <option value="cassette">Cassette</option>
        <option value="floor stand">Floor Stand</option>
        <option value="package units">Package Units</option>
    `;

    cell1.innerHTML = `<select name="Type[]" onchange="updateTonOptions(this, '${record.ton || ''}')">${typeOptions}</select>`;
    cell2.innerHTML = '<select name="TON[]"></select>';
    cell3.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';
    cell4.innerHTML = '<input type="number" name="Unit Price[]" oninput="updateTotal(this)">';
    cell5.innerHTML = '<input type="number" name="Total Price[]" readonly>';

    cell7.innerHTML = `
        <button type="button" onclick="addRow(this)">+</button>
        <button type="button" onclick="deleteRow(this)">-</button>
    `;
    const supplyIdValue = record.supply_id || 'not found';
    cell6.innerHTML = `<input type="readonly" name="supplyId[]" value="${supplyIdValue} "readonly>`;
    cell6.style.display = 'none';


    if (record.type) {
        cell1.querySelector('select[name="Type[]"]').value = record.type;
    }
    updateTonOptions(cell1.querySelector('select[name="Type[]"]'), record.ton || '');
    if (record.quantity) {
        cell3.querySelector('input[name="Quantity[]"]').value = record.quantity;
    }
    if (record.unit_price) {
        cell4.querySelector('input[name="Unit Price[]"]').value = record.unit_price;
    }
    if (record.total_price) {
        cell5.querySelector('input[name="Total Price[]"]').value = record.total_price;
    }

    updateButtons();
}


function updateTonOptions(selectElement, selectedTon = '') {
    const tonSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="TON[]"]');
    const typeValue = selectElement.value;

    const tonOptions = {
        'ducted split units': ["1.50", "2.50", "2.75", "3.00", "4.26", "5.00", "6.66", "8.33"],
        'wall mounted split units': ["1.00", "1.50", "2.00", "2.50", "3.00"],
        'cassette': ["1.50", "2.50", "2.75", "3.00", "4.00", "4.25"],
        'floor stand': ["2.30", "3.25", "4.00", "4.35"],
        'package units': ["6.80", "9.10", "10.00", "13.65", "18.20", "20.00", "28.50"]
    };

    // Clear existing options
    tonSelect.innerHTML = '';

    // Populate options
    if (tonOptions[typeValue]) {
        tonOptions[typeValue].forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.text = option;
            tonSelect.add(optionElement);
        });
    }

    // Ensure selectedTon is a string, handle case where it might be an HTML element
    if (selectedTon instanceof HTMLElement) {
        console.error('Invalid selectedTon: Expected a string but got an HTML element.');
        selectedTon = '';
    } else {
        selectedTon = (selectedTon || '').toString().trim();
    }

    // Check if the selectedTon matches any of the options
    const matchingOption = Array.from(tonSelect.options).find(option => option.value === selectedTon);

    if (matchingOption) {
        tonSelect.value = matchingOption.value;
        console.log(`Selected TON set to: ${matchingOption.value}`);
    } else {
        // If no match found, select the first option and log a warning
        tonSelect.selectedIndex = 0;
        console.warn(`TON value "${selectedTon}" not found. Defaulting to the first option.`);
    }
}


async function initializeTonOptions() {
    console.log('Initializing TON options');
    const rows = document.querySelectorAll('#supplyInstTable tbody tr');
    rows.forEach(row => {
        const modelSelect = row.querySelector('select[name="Type[]"]');
        const selectedModel = modelSelect ? modelSelect.value : '';
        const tonSelect = row.querySelector('select[name="TON[]"]');
        
        console.log('Model:', selectedModel);
        console.log('TON Select:', tonSelect);
        
        updateTonOptions(modelSelect, tonSelect.value);
    });
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
    const revise = document.getElementById('revise').checked;
    const tableRows = document.querySelectorAll('#supplyInstTable tbody tr');

    const supplyData = [];

    tableRows.forEach((row, index) => {
        console.log(`Row ${index} HTML:`, row.innerHTML);
        const supplyIdElement = row.querySelector('input[name="supplyId[]"]');
        console.log(`Row ${index} supply_id value:`, supplyIdElement ? supplyIdElement.value : 'not found');
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
                supply_id: supplyIdElement ? supplyIdElement.value : null,
                type: typeElement ? typeElement.value : null,
                ton: tonElement ? tonElement.value : null,
                quantity: quantityElement ? quantityElement.value : null,
                unit_price: unitPriceElement ? unitPriceElement.value : null,
                total_price: totalPriceElement ? totalPriceElement.value : null
            });
        } else {
            console.error(`Error: Missing elements in row ${index}`);
        }
    });

    if (supplyData.length === 0) {
        alert('Please fill in all fields before submitting.');
        return;
    }

    const payload = {
        quotation_id: quotationId,
        customer_id: customerId,
        supply_data: supplyData,
        revise: revise // Added revise to payload
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
document.addEventListener('DOMContentLoaded', () => {
    initializeTonOptions();
});

function goBack() {
    window.history.back();
}