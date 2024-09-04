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

    const typeOptions = `
        <option value="VD-15">VD-15</option>
        <option value="VD-10">VD-10</option>
        <option value="lineo-100QVO">lineo-100QVO</option>
        <option value="CA-100MD">CA-100MD</option>
    `;

    cell1.innerHTML = `<select name="Type[]">${typeOptions}</select>`;
    cell2.innerHTML = `<input type="text" name="Location[]" value="${record.location || ''}">`;
    cell3.innerHTML = `<input type="number" name="Quantity[]" value="${record.quantity || ''}" oninput="updateTotal(this)">`;
    cell4.innerHTML = `<input type="number" name="Unit Price[]" value="${record.unit_price || ''}" oninput="updateTotal(this)">`;
    cell5.innerHTML = `<input type="number" name="Total Price[]" value="${record.total_price || ''}" readonly>`;
    cell7.innerHTML = `
        <button type="button" onclick="addRow(this)">+</button>
        <button type="button" onclick="deleteRow(this)">-</button>
    `;
    const supplyIdValue = record.supply_id || 'not found';
    cell6.innerHTML = `<input type="readonly" name="supplyId[]" value="${supplyIdValue} "readonly>`;
    cell6.style.display = 'none';


    // If record data exists, set the appropriate values
    if (record.type) {
        cell1.querySelector('select[name="Type[]"]').value = record.type;
    }
    if (record.location) {
        cell2.querySelector('input[name="Location[]"]').value = record.location;
    }
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

// Assuming updateTotal and updateButtons are functions already defined elsewhere in your script


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
    const tableRows = document.querySelectorAll('#supplyTable tbody tr');

    const supplyData = [];

    tableRows.forEach((row, index) => {
        console.log(`Row ${index} HTML:`, row.innerHTML);
        const supplyIdElement = row.querySelector('input[name="supplyId[]"]');
        console.log(`Row ${index} supply_id value:`, supplyIdElement ? supplyIdElement.value : 'not found');
        const typeElement = row.querySelector('select[name="Type[]"]');
        const locationElement = row.querySelector('input[name="Location[]"]');
        const quantityElement = row.querySelector('input[name="Quantity[]"]');
        const unitPriceElement = row.querySelector('input[name="Unit Price[]"]');
        const totalPriceElement = row.querySelector('input[name="Total Price[]"]');

        // Debugging output
        console.log(`Row ${index}:`, {
            typeElement,
            locationElement,
            
            quantityElement,
            unitPriceElement,
            totalPriceElement
        });

        // Ensure all elements are found before accessing their values
        if (typeElement && locationElement && quantityElement && unitPriceElement && totalPriceElement) {
            supplyData.push({
                supply_id: supplyIdElement ? supplyIdElement.value : null,
                type: typeElement ? typeElement.value : null,
                location: locationElement ? locationElement.value :null,
                quantity: quantityElement ? quantityElement.value : null,
                unit_price: unitPriceElement ? unitPriceElement.value : null,
                total_price: totalPriceElement ? totalPriceElement.value : null
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
        const response = await fetch('/api/savefan', {
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

async function fetchSupplyData() {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');

    if (!quotationId) {
        console.error('Quotation ID is not provided');
        return;
    }

    console.log('Fetching supply data for quotationId:', quotationId);

    try {
        const response = await fetch(`/api/fan_edit/${quotationId}`);
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