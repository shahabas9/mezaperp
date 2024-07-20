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

function deleteRow(button) {
    var row = button.parentNode.parentNode;
    var table = row.parentNode;
    table.removeChild(row);
    updateButtons();
}

function addRow(button) {
    var table = document.getElementById("supplyTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    var cell5 = newRow.insertCell(4);
    var cell6 = newRow.insertCell(5);

    cell1.innerHTML = '<select name="Location[]"><option value="Ground Floor">Ground Floor</option><option value="First Floor">First Floor</option><option value="Basement">Basement</option><option value="Mezzanine">Mezzanine</option><option value="Penthouse">Penthouse</option><option value="Out Majlis">Out Majlis</option><option value="Out Kitchen">Out Kitchen</option><option value="Outblock">Outblock</option></select>';
    cell2.innerHTML = '<input type="text" name="Serving Area[]">';
    cell3.innerHTML = '<select name="Type[]" onchange="updateTonOptions(this)"><option value="ducted split">Ducted Split</option><option value="wall mounted">Wall Mounted</option><option value="cassette">Cassette</option><option value="floor stand">Floor Stand</option><option value="package units">Package Unit</option></select>';
    cell4.innerHTML = '<select name="TON[]"></select>';
    cell5.innerHTML = '<input type="number" name="Quantity[]">';
    cell6.innerHTML = '<button type="button" onclick="addRow(this)">+</button> <button type="button" onclick="deleteRow(this)">-</button>';

    // Initialize TON options based on the default Type value
    updateTonOptions(newRow.querySelector('select[name="Type[]"]'));
    
    updateButtons();
}

function updateTonOptions(selectElement) {
    var tonSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="TON[]"]');
    var typeValue = selectElement.value;
    
    tonSelect.innerHTML = ''; // Clear existing options

    if (typeValue === 'ducted split') {
        tonSelect.innerHTML = '<option value="1.5">1.5</option><option value="2.5">2.5</option><option value="2.75">2.75</option><option value="3">3</option><option value="4.26">4.26</option><option value="5">5</option><option value="6.66">6.66</option><option value="8.33">8.33</option>';
    } else if (typeValue === 'wall mounted') {
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
    const tableRows = document.querySelectorAll('#supplyTable tbody tr');

    const supplyData = [];

    tableRows.forEach((row, index) => {
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

    const payload = {
        quotation_id: quotationId,
        customer_id: customerId,
        supply_data: supplyData
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