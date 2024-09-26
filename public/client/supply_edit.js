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
    <option value="ducted split Unit">Ducted Split Unit</option><option value="wall mounted split units">Wall Mounted Split Units</option>
    <option value="floorstand">Floor Stand</option>
    <option value="cassette">Cassette</option>
    <option value="vrf indoor units">VRF Indoor Units</option>
    <option value="vrf outdoor units">VRF Outdoor Units</option>
    <option value="air curtain">Air Curtain</option>
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
        'cassette': [
            "PLY-P18 BLACM/SUY-P18VA",
            "PLY-P24 BLACM/SUY-P24VA",
            "PLY-P30 BLACM/SUY-P30VA",
            "PLY-P36 BLACM/SUY-P36VA",
            "PLY-P42 BLACM/SUY-P42VA",
            "PLY-P48 BLACM/SUY-P48VA"
        ],
        'floorstand': [
            "PSA-RP71GA",
            "PSA-RP100GA",
            "PSA-RP125GA",
            "PSA-RP140GA"
        ],
        'package unit': [
            "PRC 200",
            "PRC 250",
            "PRC 300",
            "PRC 400",
            "PRC 500",
            "PRC 600",
            "PRC 900"
        ],
        'air curtain': [
            "GK-2509 YSI (90 cm)",
            "GK 3509 CS (90 cm)",
            "GK 2512 Y (120 cm)",
            "GK 3512 DS (120 cm)"
        ],
        'vrf indoor units': [
            "PEFY-P20VMAL-E",
            "PEFY-P25VMAL-E",
            "PEFY-P32VMAL-E",
            "PEFY-P40VMAL-E",
            "PEFY-P50VMAL-E",
            "PEFY-P63VMAL-E",
            "PEFY-P71VMAL-E",
            "PEFY-P80VMAL-E",
            "PEFY-P100VMAL-E",
            "PEFY-P125VMAL-E",
            "PEFY-P140VMAL-E",
            "PEFY-P200VMHS-E",
            "PEFY-P250VMHS-E"
        ],
        'vrf outdoor units': [
            "PUCY-P200YKA",
            "PUCY-P250YKA",
            "PUCY-P300YKA",
            "PUCY-P350YKA",
            "PUCY-P400YKA",
            "PUCY-P450YKA",
            "PUCY-P500YKA",
            "PUCY-P550YSKA",
            "PUCY-P600YSKA",
            "PUCY-P650YSKA",
            "PUCY-P700YSKA",
            "PUCY-P750YSKA",
            "PUCY-P800YSKA",
            "PUCY-P850YSKA",
            "PUCY-P900YSKA",
            "PUCY-P950YSKA",
            "PUCY-P1000YSKA",
            "PUCY-P1050YSKA",
            "PUCY-P1100YSKA",
            "PUCY-P1150YSKA",
            "PUCY-P1200YSKA",
            "PUCY-P1250YSKA",
            "PUCY-P1300YSKA",
            "PUCY-P1350YSKA",
            "PUCY-P1400YSKA",
            "PUCY-P1450YSKA",
            "PUCY-P1500YSKA"
        ]
    };
    
    // Use this updated modelOptions for your function.
    

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

    // Mapping model types to their corresponding ton options
    const modelTons = {
        'PEY-P18JA / SUY-P18': ['1.5'],
        'PLY-P18 BLACM/SUY-P18VA': ['1.5'],
        'PLY-P24 BLACM/SUY-P24VA': ['2.5'],
        'PLY-P30 BLACM/SUY-P30VA': ['2.75'],
        'PLY-P36 BLACM/SUY-P36VA': ['3'],
        'PLY-P42 BLACM/SUY-P42VA': ['4'],
        'PLY-P48 BLACM/SUY-P48VA': ['4.25'],
        'GK-2509 YSI (90 cm)': ['90'],
        'GK 3509 CS (90 cm)': ['90'],
        'GK 2512 Y (120 cm)': ['120'],
        'GK 3512 DS (120 cm)': ['120'],
        'PEY-P24JA / SUY-P24': ['2.5'],
        'PEY-P30JA / SUY-P30': ['2.75'],
        'PEY-P36JA / SUY-P36': ['3'],
        'PEY-P45JG / PUY-P45': ['4.26'],
        'PEY-P60GAG / PUY-P60': ['5'],
        'PEV-P200 / PUV-P200': ['6.66'],
        'PEV-P250 / PUV-P250': ['8.33'],
        'MS-GS13/ MU-GS13': ['1'],
        'MS-GS18/ MU-GS18': ['1.5'],
        'MS-GS24/ MU-GS24': ['2'],
        'MS-GS30/ MU-GS30': ['2.5'],
        'MS-GS36/ MU-GS36': ['3'],
        'PSA-RP71GA': ['2.3'],
        'PSA-RP100GA': ['3.25'],
        'PSA-RP125GA': ['4'],
        'PSA-RP140GA': ['4.35'],
        'PRC 200': ['6.8'],
        'PRC 250': ['9.1'],
        'PRC 300': ['10'],
        'PRC 400': ['13.65'],
        'PRC 500': ['18.2'],
        'PRC 600': ['20'],
        'PRC 900': ['28.5'],
        'PEFY-P20VMAL-E': ['2.2', '0.63'],
        'PEFY-P25VMAL-E': ['2.8', '0.80'],
        'PEFY-P32VMAL-E': ['3.6', '1.02'],
        'PEFY-P40VMAL-E': ['4.5', '1.28'],
        'PEFY-P50VMAL-E': ['5.6', '1.59'],
        'PEFY-P63VMAL-E': ['7.1', '2.02'],
        'PEFY-P71VMAL-E': ['8', '2.27'],
        'PEFY-P80VMAL-E': ['9', '2.56'],
        'PEFY-P100VMAL-E': ['11.2', '3.18'],
        'PEFY-P125VMAL-E': ['14', '3.98'],
        'PEFY-P140VMAL-E': ['16', '4.55'],
        'PEFY-P200VMHS-E': ['22.24', '6.37'],
        'PEFY-P250VMHS-E': ['28', '7.96'],
        'PUCY-P200YKA': ['22.24', '6.37'],
        'PUCY-P250YKA': ['28', '7.96'],
        'PUCY-P300YKA': ['33.5', '9.53'],
        'PUCY-P350YKA': ['40', '11.37'],
        'PUCY-P400YKA': ['44', '12.51'],
        'PUCY-P450YKA': ['48', '13.65'],
        'PUCY-P500YKA': ['56', '15.92'],
        'PUCY-P550YSKA': ['61.5', '17.49'],
        'PUCY-P600YSKA': ['68', '19.34'],
        'PUCY-P650YSKA': ['72', '20.47'],
        'PUCY-P700YSKA': ['76', '21.61'],
        'PUCY-P750YSKA': ['81.5', '23.17'],
        'PUCY-P800YSKA': ['88', '25.02'],
        'PUCY-P850YSKA': ['92', '26.16']
        // Add more mappings as needed
    };

    // Clear existing options in the ton select element
    tonSelect.innerHTML = '';

    // Populate ton options based on the selected model type
    if (modelTons[typeValue]) {
        modelTons[typeValue].forEach(function(ton) {
            var option = document.createElement('option');
            option.value = ton;
            option.text = ton;
            tonSelect.appendChild(option);
        });
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