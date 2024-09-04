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
    var table = document.getElementById("supplyTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(button ? button.parentNode.parentNode.rowIndex : table.rows.length);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    

    var typeOptions = `
        <option value="ducted split units">Ducted Split Units</option>
        <option value="wall mounted split units">Wall Mounted Split Units</option>
        <option value="cassette">Cassette</option>
        <option value="floor stand">Floor Stand</option>
        <option value="package units">Package Units</option>
    `;

    cell1.innerHTML = `<select name="Type[]">${typeOptions}</select>`;
    cell2.innerHTML = `<input type="number" name="Quantity[]" value="${record.quantity || ''}">`;
    cell4.innerHTML = `
        <button type="button" onclick="addRow(this)">+</button>
        <button type="button" onclick="deleteRow(this)">-</button>
    `;
    const supplyIdValue = record.supply_id || 'not found';
    cell3.innerHTML = `<input type="readonly" name="supplyId[]" value="${supplyIdValue} "readonly>`;
    cell3.style.display = 'none';

    if (record.type) {
        cell1.querySelector('select[name="Type[]"]').value = record.type;
    }
    if (record.quantity) {
        cell2.querySelector('input[name="Quantity[]"]').value = record.quantity;
    }

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
        const response = await fetch(`/api/amc_edit/${quotationId}`);
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
        const typeElement = row.querySelector('select[name="Type[]"]');
        
        const quantityElement = row.querySelector('input[name="Quantity[]"]');
        

        // Ensure all elements are found before accessing their values
        if (typeElement && quantityElement ) {
            supplyData.push({
                supply_id: supplyIdElement ? supplyIdElement.value : null,
                type: typeElement ? typeElement.value : null,
               
                quantity: quantityElement ? quantityElement.value : null
                
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
        const response = await fetch('/api/saveamc', {
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
updateButtons();