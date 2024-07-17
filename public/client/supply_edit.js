async function fetchSupplyData() {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');

    if (!quotationId) {
        console.error('Quotation ID is not provided');
        return;
    }

    console.log('Fetching supply data for quotationId:', quotationId);

    try {
        const response = await fetch(`/api/supply_edit/${quotationId}`);
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
    const rows = document.querySelectorAll('#supplyTable tbody tr');
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

function addRow(button, record = {}) {
    const table = document.getElementById("supplyTable").getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(table.rows.length);

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
        <option value="floorstand">Floor Stand</option>
        <option value="package unit">Package Unit</option>
        <option value="vrf">VRF</option>
    `;

    cell1.innerHTML = `<select name="Type[]" onchange="updateModelOptions(this)">${typeOptions}</select>`;
    cell2.innerHTML = '<select name="Model Inoor/Outdoor[]" onchange="updateTonOptions(this)"></select>';
    cell3.innerHTML = '<select name="TON[]"></select>';
    cell4.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';
    cell5.innerHTML = '<input type="number" name="Unit Price[]" oninput="updateTotal(this)">';
    cell6.innerHTML = '<input type="number" name="Total Price[]" readonly>';
    cell7.innerHTML = '<button type="button" onclick="addRow(this)">+</button> <button type="button" onclick="deleteRow(this)">-</button>';

    if (record.type) {
        cell1.querySelector('select[name="Type[]"]').value = record.type;
    }
    updateModelOptions(cell1.querySelector('select[name="Type[]"]'), record.model);
    if (record.model) {
        cell2.querySelector('select[name="Model Inoor/Outdoor[]"]').value = record.model;
    }
    updateTonOptions(cell2.querySelector('select[name="Model Inoor/Outdoor[]"]'), record.ton);
    if (record.ton) {
        cell3.querySelector('select[name="TON[]"]').value = record.ton;
    }
    if (record.quantity) {
        cell4.querySelector('input[name="Quantity[]"]').value = record.quantity;
    }
    if (record.unit_price) {
        cell5.querySelector('input[name="Unit Price[]"]').value = record.unit_price;
    }
    if (record.total_price) {
        cell6.querySelector('input[name="Total Price[]"]').value = record.total_price;
    }

    updateButtons();
}

function updateModelOptions(selectElement, selectedModel = '') {
    const modelSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="Model Inoor/Outdoor[]"]');
    const typeValue = selectElement.value;

    modelSelect.innerHTML = ''; // Clear existing options

    let options = '';
    if (typeValue === 'ducted split units') {
        options = `
            <option value="PEY-P18JA / SUY-P18">PEY-P18JA / SUY-P18</option>
            <option value="PEY-P24JA / SUY-P24">PEY-P24JA / SUY-P24</option>
            <option value="PEY-P30JA / SUY-P30">PEY-P30JA / SUY-P30</option>
            <option value="PEY-P36JA / SUY-P36">PEY-P36JA / SUY-P36</option>
            <option value="PEY-P45JG / PUY-P45">PEY-P45JG / PUY-P45</option>
            <option value="PEY-P60GAG / PUY-P60">PEY-P60GAG / PUY-P60</option>
            <option value="PEV-P200 / PUV-P200">PEV-P200 / PUV-P200</option>
            <option value="PEV-P250 / PUV-P250">PEV-P250 / PUV-P250</option>
        `;
    } else if (typeValue === 'wall mounted split units') {
        options = `
            <option value="MS-GS13/ MU-GS13">MS-GS13/ MU-GS13</option>
            <option value="MS-GS18/ MU-GS18">MS-GS18/ MU-GS18</option>
            <option value="MS-GS24/ MU-GS24">MS-GS24/ MU-GS24</option>
            <option value="MS-GS30/ MU-GS30">MS-GS30/ MU-GS30</option>
            <option value="MS-GS36/ MU-GS36">MS-GS36/ MU-GS36</option>
        `;
    } else if (typeValue === 'vrf') {
        options = `
            <option value="6.8">6.8</option>
            <option value="9.1">9.1</option>
            <option value="10">10</option>
            <option value="13.65">13.65</option>
            <option value="18.2">18.2</option>
            <option value="20">20</option>
        `;
    } else if (typeValue === 'floorstand') {
        options = `
            <option value="PSA-RP71GA">PSA-RP71GA</option>
            <option value="PSA-RP100GA">PSA-RP100GA</option>
            <option value="PSA-RP125GA">PSA-RP125GA</option>
            <option value="PSA-RP140GA">PSA-RP140GA</option>
        `;
    } else if (typeValue === 'package unit') {
        options = `
            <option value="PUH-P8YAK">PUH-P8YAK</option>
            <option value="PUH-P10YAK">PUH-P10YAK</option>
            <option value="PUH-P12YAK">PUH-P12YAK</option>
            <option value="PUH-P15YAK">PUH-P15YAK</option>
            <option value="PUH-P20YAK">PUH-P20YAK</option>
            <option value="PUH-P25YAK">PUH-P25YAK</option>
            <option value="PUH-P30YAK">PUH-P30YAK</option>
        `;
    }

    modelSelect.innerHTML = options;

    if (selectedModel) {
        modelSelect.value = selectedModel;
    }
}

function updateTonOptions(selectElement) {
    var tonSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="TON[]"]');
    var typeValue = selectElement.value;
    
    tonSelect.innerHTML = ''; // Clear existing options

    if (typeValue === 'PEY-P18JA / SUY-P18') {
        tonSelect.innerHTML = '<option value="1.5">1.5</option>';
    } else if (typeValue === 'PEY-P24JA / SUY-P24') {
        tonSelect.innerHTML = '<option value="2.5">2.5</option>';
    } else if (typeValue === 'PEY-P30JA / SUY-P30') {
        tonSelect.innerHTML = '<option value="2.75">2.75</option>';
    } else if (typeValue === 'PEY-P36JA / SUY-P36') {
        tonSelect.innerHTML = '<option value="3">3</option>';
    } else if (typeValue === 'PEY-P45JG / PUY-P45') {
        tonSelect.innerHTML = '<option value="4.26">4.26</option>';
    } else if (typeValue === 'PEY-P60GAG / PUY-P60') {
        tonSelect.innerHTML = '<option value="5">5</option>';
    } else if (typeValue === 'PEV-P200 / PUV-P200') {
        tonSelect.innerHTML = '<option value="6.66">6.66</option>';
    } else if (typeValue === 'PEV-P250 / PUV-P250') {
        tonSelect.innerHTML = '<option value="8.33">8.33</option>';
    } else if (typeValue === 'MS-GS13/ MU-GS13') {
        tonSelect.innerHTML = '<option value="1">1</option>';
    } else if (typeValue === 'MS-GS18/ MU-GS18') {
        tonSelect.innerHTML = '<option value="1.5">1.5</option>';
    } else if (typeValue === 'MS-GS24/ MU-GS24') {
        tonSelect.innerHTML = '<option value="2">2</option>';
    } else if (typeValue === 'MS-GS30/ MU-GS30') {
        tonSelect.innerHTML = '<option value="2.5">2.5</option>';
    } else if (typeValue === 'MS-GS36/ MU-GS36') {
        tonSelect.innerHTML = '<option value="3">3</option>'; 
    } else if (typeValue === 'PSA-RP71GA') {
        tonSelect.innerHTML = '<option value="2.3">2.3</option>'; 
    } else if (typeValue === 'PSA-RP100GA') {
        tonSelect.innerHTML = '<option value="3.25">3.25</option>'; 
    } else if (typeValue === 'PSA-RP125GA') {
        tonSelect.innerHTML = '<option value="4">4</option>'; 
    } else if (typeValue === 'PSA-RP140GA') {
        tonSelect.innerHTML = '<option value="4.35">4.35</option>'; 
    } else if (typeValue === 'PRC 200') {
        tonSelect.innerHTML = '<option value="6.8">6.8</option>'; 
    } else if (typeValue === 'PRC 250') {
        tonSelect.innerHTML = '<option value="9.1">9.1</option>'; 
    } else if (typeValue === 'PRC 300') {
        tonSelect.innerHTML = '<option value="10">10</option>'; 
    } else if (typeValue === 'PRC 400') {
        tonSelect.innerHTML = '<option value="13.65">13.65</option>'; 
    } else if (typeValue === 'PRC 500') {
        tonSelect.innerHTML = '<option value="18.2">18.2</option>'; 
    } else if (typeValue === 'PRC 600') {
        tonSelect.innerHTML = '<option value="20">20</option>'; 
    } else if (typeValue === 'PRC 900') {
        tonSelect.innerHTML = '<option value="28.5">28.5</option>'; 
    } else {
        // Add default or other specific options based on type if necessary
        tonSelect.innerHTML = '<option value="Select Model">Select Model</option>';
    }
}

function initializeModelOptions() {
    var rows = document.querySelectorAll('#supplyTable tbody tr');
    rows.forEach(function(row, index) {
        var typeSelect = row.querySelector('select[name="Type[]"]');
        updateModelOptions(typeSelect);
    });
    updateButtons();
}

function initializeTonOptions() {
    var rows = document.querySelectorAll('#supplyTable tbody tr');
    rows.forEach(function(row, index) {
        var typeSelect = row.querySelector('select[name="Model Inoor/Outdoor[]"]');
        updateTonOptions(typeSelect);
    });
    updateButtons();
}

function updateTotal(inputElement) {
    const row = inputElement.closest('tr');
    const quantity = row.querySelector('input[name="Quantity[]"]').value;
    const unitPrice = row.querySelector('input[name="Unit Price[]"]').value;
    const totalPrice = row.querySelector('input[name="Total Price[]"]');

    const total = quantity * unitPrice;
    totalPrice.value = total
}


async function handleSubmit(event) {
    event.preventDefault();

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
        quotation_id: quotationId,
        customer_id: customerId,
        supply_data: supplyData
    };

    console.log('Submitting payload:', payload);

    try {
        const response = await fetch('/api/savesupply', {
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
initializeModelOptions();
initializeTonOptions();
updateButtons();