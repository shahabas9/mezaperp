function updateButtons() {
    const rows = document.querySelectorAll('#supplyTable tbody tr');
    rows.forEach((row) => {
        const actionCell = row.querySelector('td:last-child');
        actionCell.innerHTML = `
            <button type="button" onclick="addRow(this)">+</button>
            <button type="button" onclick="deleteRow(this)">-</button>
        `;
    });
}

function deleteRow(button) {
    var row = button.parentNode.parentNode;
    var table = row.parentNode;
    table.removeChild(row);
    updateButtons();
}

function addRow(button, record = {}) {
    const table = document.getElementById("supplyTable").getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(button ? button.parentNode.parentNode.rowIndex : table.rows.length);

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);
    const cell6 = newRow.insertCell(5);
    const cell7 = newRow.insertCell(6);

    const locationOptions = `
        <option value="Ground Floor">Ground Floor</option>
        <option value="First Floor">First Floor</option>
        <option value="Basement">Basement</option>
        <option value="Mezzanine">Mezzanine</option>
        <option value="Penthouse">Penthouse</option>
        <option value="Out Majlis">Out Majlis</option>
        <option value="Out Kitchen">Out Kitchen</option>
        <option value="Outblock">Outblock</option>
    `;

    const typeOptions = `
        <option value="ducted split">Ducted Split</option>
        <option value="wall mounted">Wall Mounted</option>
        <option value="cassette">Cassette</option>
        <option value="floor stand">Floor Stand</option>
        <option value="package units">Package Unit</option>
    `;

    cell1.innerHTML = `<select name="Location[]">${locationOptions}</select>`;
   
    cell2.innerHTML = `<input type="text" name="Serving Area[]" value="${record.area || ''}">`;
    cell3.innerHTML = `<select name="Type[]" onchange="updateTonOptions(this, '${record.ton || ''}')">${typeOptions}</select>`;
    cell4.innerHTML = `<select name="TON[]"></select>`;
    cell5.innerHTML = `<input type="number" name="Quantity[]" value="${record.quantity || ''}">`;
    cell7.innerHTML = `
        <button type="button" onclick="addRow(this)">+</button>
        <button type="button" onclick="deleteRow(this)">-</button>
    `;
    const supplyIdValue = record.supply_id || 'not found';
    cell6.innerHTML = `<input type="readonly" name="supplyId[]" value="${supplyIdValue} "readonly>`;
    cell6.style.display = 'none';


    if (record.location) {
        cell1.querySelector('select[name="Location[]"]').value = record.location;
    }
    if (record.serving_area) {
        cell2.querySelector('input[name="Serving Area[]"]').value = record.area;
    }
    if (record.type) {
        cell3.querySelector('select[name="Type[]"]').value = record.type;
    }
    updateTonOptions(cell3.querySelector('select[name="Type[]"]'), record.ton || '');

    updateButtons();
}


function updateTonOptions(selectElement, selectedTon = '') {
    const tonSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="TON[]"]');
    const typeValue = selectElement.value;

    const tonOptions = {
        'ducted split': ["1.50", "2.50", "2.75", "3.00", "4.26", "5.00", "6.66", "8.33"],
        'wall mounted': ["1.00", "1.50", "2.00", "2.50", "3.00"],
        'cassette': ["1.50", "2.50", "2.75", "3.00", "4.00", "4.25"],
        'floor stand': ["2.30", "3.25", "4.00", "4.35"],
        'package units': ["6.80", "9.10", "10.00", "13.65", "18.20", "20.00", "28.50"]
    };

    // Clear existing options
    tonSelect.innerHTML = '';

    // Populate options based on selected type
    if (tonOptions[typeValue]) {
        tonOptions[typeValue].forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            tonSelect.appendChild(optionElement);
        });
    } else {
        // If no matching type is found, add a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select TON';
        tonSelect.appendChild(defaultOption);
    }

    // Ensure selectedTon is a string
    selectedTon = (selectedTon || '').toString().trim();

    // Check if the selectedTon matches any of the options
    const matchingOption = Array.from(tonSelect.options).find(option => option.value === selectedTon);

    if (matchingOption) {
        tonSelect.value = matchingOption.value;
        console.log(`Selected TON set to: ${matchingOption.value}`);
    } else if (tonSelect.options.length > 0) {
        // If no match found, select the first option and log a warning
        tonSelect.selectedIndex = 0;
        console.warn(`TON value "${selectedTon}" not found. Defaulting to the first option.`);
    }
}


function initializeTonOptions() {
    var rows = document.querySelectorAll('#supplyTable tbody tr');
    rows.forEach(function(row, index) {
        var typeSelect = row.querySelector('select[name="Type[]"]');
        updateTonOptions(typeSelect);
    });
    updateButtons();
}

async function fetchSupplyData() {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');

    if (!quotationId) {
        console.error('Quotation ID is not provided');
        return;
    }

    console.log('Fetching supply data for quotationId:', quotationId);

    try {
        const response = await fetch(`/api/villa_edit/${quotationId}`);
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

async function handleSubmit(event) {
    event.preventDefault();

    const customerId = document.getElementById('customer').value;
    const quotationId = document.getElementById('quotation').value;
    const revise = document.getElementById('revise').checked;
    const tableRows = document.querySelectorAll('#supplyTable tbody tr');

    const supplyData = [];

    tableRows.forEach((row, index) => {
        console.log(`Row ${index} HTML:`, row.innerHTML);
        const supplyIdElement = row.querySelector('input[name="supplyId[]"]');
        console.log(`Row ${index} supply_id value:`, supplyIdElement ? supplyIdElement.value : 'not found');
        const locationElement = row.querySelector('select[name="Location[]"]');
        const areaElement = row.querySelector('input[name="Serving Area[]"]');
        const typeElement = row.querySelector('select[name="Type[]"]');
        const tonElement = row.querySelector('select[name="TON[]"]');
        const quantityElement = row.querySelector('input[name="Quantity[]"]');

        // Debugging output
        console.log(`Row ${index}:`, {
            locationElement,
            areaElement,
            typeElement,
            tonElement,
            quantityElement
        });

        // Ensure all elements are found before accessing their values
        if (locationElement && areaElement && typeElement && tonElement && quantityElement ) {
            supplyData.push({
                supply_id: supplyIdElement ? supplyIdElement.value : null,
                location: locationElement.value,
                area: areaElement.value,
                type: typeElement.value,
                ton: tonElement.value,
                quantity: quantityElement.value
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
        const response = await fetch('/api/savevilla', {
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

function goBack() {
    window.history.back();
}