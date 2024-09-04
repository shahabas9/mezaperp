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

    // Add rows to the table
    data.forEach(record => {
        addRow(null, record);
    });

    // Initialize TON options for each row
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const modelSelect = row.querySelector('select[name="Model Indoor/Outdoor[]"]');
        const tonSelect = row.querySelector('select[name="TON[]"]');
        
        if (modelSelect && tonSelect) {
            updateTonOptions(modelSelect, tonSelect);
        }
    });

    updateButtons();
}


window.onload = fetchSupplyData;

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
    const row = button.parentNode.parentNode;
    const table = row.parentNode;
    table.removeChild(row);
    updateButtons();
}

function addRow(button, record = {}) {
    const table = document.getElementById("supplyTable").getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(button ? button.parentNode.parentNode.rowIndex : table.rows.length);

    // Define the cells
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);
    const cell6 = newRow.insertCell(5);
    const cell7 = newRow.insertCell(6);
    const cell8 = newRow.insertCell(7); // Cell for hidden supply_id

    // Populate the cells with content
    const typeOptions = `
        <option value="ducted split units">Ducted Split Units</option>
        <option value="wall mounted split units">Wall Mounted Split Units</option>
        <option value="floorstand">Floor Stand</option>
        <option value="package unit">Package Unit</option>
        <option value="vrf">VRF</option>
    `;
    cell1.innerHTML = `<select name="Type[]" onchange="updateModelOptions(this)">${typeOptions}</select>`;
    cell2.innerHTML = '<select name="Model Indoor/Outdoor[]" onchange="updateTonOptions(this)"></select>';
    cell3.innerHTML = '<select name="TON[]"></select>';
    cell4.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';
    cell5.innerHTML = '<input type="number" name="Unit Price[]" oninput="updateTotal(this)">';
    cell6.innerHTML = '<input type="number" name="Total Price[]" readonly>';

    // Add + and - buttons
    cell8.innerHTML = `
        <button type="button" onclick="addRow(this)">+</button>
        <button type="button" onclick="deleteRow(this)">-</button>
    `;

    // Add hidden input for supply_id and set value
    const supplyIdValue = record.supply_id || 'not found';
    cell7.innerHTML = `<input type="readonly" name="supplyId[]" value="${supplyIdValue} "readonly>`;
    cell7.style.display = 'none';


    

    // Populate row with data if available
    if (record.type) cell1.querySelector('select[name="Type[]"]').value = record.type;
    updateModelOptions(cell1.querySelector('select[name="Type[]"]'), record.model);
    if (record.model) cell2.querySelector('select[name="Model Indoor/Outdoor[]"]').value = record.model;
    updateTonOptions(cell2.querySelector('select[name="Model Indoor/Outdoor[]"]'), record.ton);
    if (record.ton) cell3.querySelector('select[name="TON[]"]').value = record.ton;
    if (record.quantity) cell4.querySelector('input[name="Quantity[]"]').value = record.quantity;
    if (record.unit_price) cell5.querySelector('input[name="Unit Price[]"]').value = record.unit_price;
    if (record.total_price) cell6.querySelector('input[name="Total Price[]"]').value = record.total_price;

    updateButtons();
}




function updateModelOptions(selectElement, selectedModel = '') {
    const modelSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="Model Indoor/Outdoor[]"]');
    const typeValue = selectElement.value;

    const modelOptions = {
        'ducted split units': [
            "PEY-P18JA / SUY-P18",
            "PEY-P24JA / SUY-P24",
            "PEY-P30JA / SUY-P30",
            "PEY-P36JA / SUY-P36",
            "PEY-P45JG / PUY-P45",
            "PEY-P60GAG / PUY-P60",
            "PEV-P200 / PUV-P200",
            "PEV-P250 / PUV-P250"
        ],
        'wall mounted split units': [
            "MS-GS13/ MU-GS13",
            "MS-GS18/ MU-GS18",
            "MS-GS24/ MU-GS24",
            "MS-GS30/ MU-GS30",
            "MS-GS36/ MU-GS36"
        ],
        'vrf': [
            "6.8",
            "9.1",
            "10",
            "13.65",
            "18.2",
            "20"
        ],
        'floorstand': [
            "PSA-RP71GA",
            "PSA-RP100GA",
            "PSA-RP125GA",
            "PSA-RP140GA"
        ],
        'package unit': [
            "PUH-P8YAK",
            "PUH-P10YAK",
            "PUH-P12YAK",
            "PUH-P15YAK",
            "PUH-P20YAK",
            "PUH-P25YAK",
            "PUH-P30YAK"
        ]
    };

    // Clear existing options
    modelSelect.innerHTML = '';

    // Populate options
    if (modelOptions[typeValue]) {
        modelSelect.innerHTML = modelOptions[typeValue].map(option => `<option value="${option}">${option}</option>`).join('');
    }

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

async function initializeTonOptions() {
    console.log('Initializing TON options');
    const rows = document.querySelectorAll('#supplyTable tbody tr');
    rows.forEach(row => {
        const modelSelect = row.querySelector('select[name="Model Indoor/Outdoor[]"]');
        const selectedModel = modelSelect ? modelSelect.value : '';
        const tonSelect = row.querySelector('select[name="TON[]"]');
        
        console.log('Model:', selectedModel);
        console.log('TON Select:', tonSelect);
        
        updateTonOptions(modelSelect, tonSelect, selectedModel);
    });
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
    const revise = document.getElementById('revise').checked;
    const tableRows = document.querySelectorAll('#recordsTableBody tr');

    const supplyData = [];

    tableRows.forEach((row, index) => {
        console.log(`Row ${index} HTML:`, row.innerHTML);
        const supplyIdElement = row.querySelector('input[name="supplyId[]"]');
        console.log(`Row ${index} supply_id value:`, supplyIdElement ? supplyIdElement.value : 'not found');
        const typeElement = row.querySelector('select[name="Type[]"]');
        const modelElement = row.querySelector('select[name="Model Indoor/Outdoor[]"]');
        const tonElement = row.querySelector('select[name="TON[]"]');
        const quantityElement = row.querySelector('input[name="Quantity[]"]');
        const unitPriceElement = row.querySelector('input[name="Unit Price[]"]');
        const totalPriceElement = row.querySelector('input[name="Total Price[]"]');

        console.log(`Row ${index} data:`, {
            supply_id: supplyIdElement ? supplyIdElement.value : 'not found',
            type: typeElement ? typeElement.value : 'not found',
            model: modelElement ? modelElement.value : 'not found',
            ton: tonElement ? tonElement.value : 'not found',
            quantity: quantityElement ? quantityElement.value : 'not found',
            unit_price: unitPriceElement ? unitPriceElement.value : 'not found',
            total_price: totalPriceElement ? totalPriceElement.value : 'not found'
        });

        supplyData.push({
            supply_id: supplyIdElement ? supplyIdElement.value : null,
            type: typeElement ? typeElement.value : null,
            model:modelElement ? modelElement.value : null,
            ton: tonElement ? tonElement.value : null,
            quantity: quantityElement ? quantityElement.value : null,
            unit_price: unitPriceElement ? unitPriceElement.value : null,
            total_price: totalPriceElement ? totalPriceElement.value : null
           });
       });

       if (supplyData.length === 0) {
           alert('Please fill in all fields before submitting.');
           return;
       }

       const payload = {
           quotation_id: quotationId,
           customer_id: customerId,
           supply_data: supplyData,
           revise: revise
       };

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








initializeModelOptions();
initializeTonOptions();
updateButtons();

document.addEventListener('DOMContentLoaded', () => {
    initializeTonOptions();
});

function goBack() {
    window.history.back();
}