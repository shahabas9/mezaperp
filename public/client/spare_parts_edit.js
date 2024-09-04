function updateButtons() {
    var rows = document.querySelectorAll('#supplyTable tbody tr');
    rows.forEach(function(row, index) {
        var actionCell = row.querySelector('td:last-child');
        actionCell.innerHTML = '';
        
        if (rows.length === 1) {
            actionCell.innerHTML = '<button onclick="addRow(this)">+</button>';
        } else if (index === 0) {
            actionCell.innerHTML = '<button onclick="addRow(this)">+</button>';
        } else if (index === rows.length - 1) {
            actionCell.innerHTML = '<button onclick="addRow(this)">+</button> <button onclick="deleteRow(this)">-</button>';
        } else {
            actionCell.innerHTML = '<button onclick="deleteRow(this)">-</button>';
        }
    });
}

function deleteRow(button) {
    var row = button.parentNode.parentNode;
    var table = row.parentNode;
    table.removeChild(row);
    updateButtons();
}

function addRow(button,record = {}) {
    var table = document.getElementById("supplyTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    var cell5 = newRow.insertCell(4);
    var cell6 = newRow.insertCell(5);
    var cell7 = newRow.insertCell(6);
    

    cell1.innerHTML = '<select name="Type[]" onchange="updateModelOptions(this)"><option value="Compressor">Compressor</option><option value="INVERTER PCB">INVERTER PCB</option><option value="Wireless Remote">Wireless Remote</option><option value="Outdoor Motor Rewinding">Outdoor Motor Rewinding</option><option value="Outdoor Motor Bearing">Outdoor Motor Bearing</option><option value="Outdoor Motor Brush">Outdoor Motor Brush</option><option value="Filter Drier">Filter Drier</option><option value="Splite AC Blade">Splite AC Blade</option><option value="Contractor">Contractor</option><option value="Fan Belt">Fan Belt</option><option value="Fan Motor Rewinding">Fan Motor Rewinding</option><option value="PCB Board">PCB Board</option><option value="Exhaust Fan">Exhaust Fan</option><option value="Motor for Duct Split Unit">Motor for Duct Split Unit</option><option value="Propeller Fan for Duct Split Unit">Propeller Fan for Duct Split Unit</option>';
    cell2.innerHTML = '<select name="Model[]"></select>';
    cell3.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';
    cell4.innerHTML = '<input type="number" name="Unit Price[]" oninput="updateTotal(this)">';
    cell5.innerHTML = '<input type="number" name="Total Price[]" readonly>';
    cell7.innerHTML = '<button onclick="addRow(this)">+</button> <button onclick="deleteRow(this)">-</button>';
    const supplyIdValue = record.supply_id || 'not found';
    cell6.innerHTML = `<input type="readonly" name="supplyId[]" value="${supplyIdValue} "readonly>`;
    cell6.style.display = 'none';
    // Initialize Model options based on the default Type value
    updateModelOptions(newRow.querySelector('select[name="Type[]"]'));
    
    if (record.type) cell1.querySelector('select[name="Type[]"]').value = record.type;
    updateModelOptions(cell1.querySelector('select[name="Type[]"]'), record.model);
    if (record.model) cell2.querySelector('select[name="Model[]"]').value = record.model;
    
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

function updateModelOptions(selectElement) {
    var modelSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="Model[]"]');
    var typeValue = selectElement.value;
    
    modelSelect.innerHTML = ''; // Clear existing options

    if (typeValue === 'Compressor') {
        modelSelect.innerHTML = '<option value="ZR125KC">ZR125KC</option><option value="ZP137KCE">ZP137KCE</option><option value="BH82YEHT">BH82YEHT</option><option value="BH96YEHT">BH96YEHT</option>';
    } else if (typeValue === 'INVERTER PCB') {
        modelSelect.innerHTML = '<option value="E2716E451">E2716E451</option>';
    } else if (typeValue === 'Wireless Remote') {
        modelSelect.innerHTML = '<option value="PAR-FL32">PAR-FL32</option><option value="PAR-FA32">PAR-FA32</option>';
    } else if (typeValue === 'Contractor') {
        modelSelect.innerHTML = '<option value="CLK26J">CLK26J</option><option value="PAK-6J">PAK-6J</option>'; 
    }else if (typeValue === 'Exhaust Fan') {
        modelSelect.innerHTML = '<option value="CA-100MD">CA-100MD</option>'; 
    } else if (typeValue === 'Motor for Duct Split Unit') {
        modelSelect.innerHTML = '<option value="E27364301">E27364301</option>'; 
    } else if (typeValue === 'Propeller Fan for Duct Split Unit') {
        modelSelect.innerHTML = '<option value="E17364501">E17364501</option>'; 
    } else {
        // Add default or other specific options based on type if necessary
        modelSelect.innerHTML = '<option value="Default Model">Default Model</option>';
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
    const tableRows = document.querySelectorAll('#supplyTable tbody tr');

    const supplyData = [];

    tableRows.forEach((row, index) => {
        console.log(`Row ${index} HTML:`, row.innerHTML);
        const supplyIdElement = row.querySelector('input[name="supplyId[]"]');
        console.log(`Row ${index} supply_id value:`, supplyIdElement ? supplyIdElement.value : 'not found');
        const typeElement = row.querySelector('select[name="Type[]"]');
        const modelElement = row.querySelector('select[name="Model[]"]');
        const quantityElement = row.querySelector('input[name="Quantity[]"]');
        const unitPriceElement = row.querySelector('input[name="Unit Price[]"]');
        const totalPriceElement = row.querySelector('input[name="Total Price[]"]');

        // Debugging output
        console.log(`Row ${index}:`, {
            typeElement,
            modelElement,
            quantityElement,
            unitPriceElement,
            totalPriceElement
        });

        // Ensure all elements are found before accessing their values
        if (typeElement && modelElement && quantityElement && unitPriceElement && totalPriceElement) {
            supplyData.push({
                supply_id: supplyIdElement ? supplyIdElement.value : 'not found',
                type: typeElement ? typeElement.value : 'not found',
                model: modelElement ? modelElement.value : 'not found',
                quantity: quantityElement ? quantityElement.value : 'not found',
                unit_price: unitPriceElement ? unitPriceElement.value : 'not found',
                total_price: totalPriceElement ? totalPriceElement.value : 'not found'
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
        const response = await fetch('/api/savesp', {
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

async function fetchSupplyData() {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');

    if (!quotationId) {
        console.error('Quotation ID is not provided');
        return;
    }

    console.log('Fetching supply data for quotationId:', quotationId);

    try {
        const response = await fetch(`/api/sp_edit/${quotationId}`);
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

initializeModelOptions();
updateButtons();