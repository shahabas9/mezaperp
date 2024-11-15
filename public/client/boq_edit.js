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

function addRow(button,record={}) {
    var table = document.getElementById("supplyTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    var cell5 = newRow.insertCell(4);
    
    cell1.innerHTML = '<input type="number" name="supply_cost[]" oninput="updateTotal(this)">';
    cell2.innerHTML = '<input type="number" name="installation_cost[]" oninput="updateTotal(this)">';
    cell3.innerHTML = '<input type="number" name="total_amount[]" readonly>';
    cell5.innerHTML = '<button onclick="addRow(this)">+</button> <button onclick="deleteRow(this)">-</button>';
    
    const supplyIdValue = record.supply_id || 'not found';
    cell4.innerHTML = `<input type="readonly" name="supplyId[]" value="${supplyIdValue} "readonly>`;
    cell4.style.display = 'none';

    if (record.supply_amount) {
        cell1.querySelector('input[name="supply_cost[]"]').value = record.supply_amount;
    }
    if (record.installation_amount) {
        cell2.querySelector('input[name="installation_cost[]"]').value = record.installation_amount;
    }
    if (record.total_amount) {
        cell3.querySelector('input[name="total_amount[]"]').value = record.total_amount;
    }


    updateButtons();
}

function updateTotal(element) {
    var row = element.parentNode.parentNode;
    var supplyInput = row.querySelector('input[name="supply_cost[]"]');
    var installationInput = row.querySelector('input[name="installation_cost[]"]');
    var totalInput = row.querySelector('input[name="total_amount[]"]');
    
    var supplyPrice = parseFloat(supplyInput.value) || 0;
    var installationPrice = parseFloat(installationInput.value) || 0;
    
    totalInput.value = (supplyPrice + installationPrice); // Calculate and set the total tonnage
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
        const response = await fetch(`/api/boq_edit/${quotationId}`);
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
        const supplyElement = row.querySelector('input[name="supply_cost[]"]');
        const installationPriceElement = row.querySelector('input[name="installation_cost[]"]');
        const totalPriceElement = row.querySelector('input[name="total_amount[]"]');

        // Debugging output
        console.log(`Row ${index}:`, {
            supplyElement,
            installationPriceElement,
            totalPriceElement
        });

        // Ensure all elements are found before accessing their values
        if ( supplyElement && installationPriceElement && totalPriceElement) {
            supplyData.push({
                supply_id: supplyIdElement ? supplyIdElement.value : null,
                supply: supplyElement ? supplyElement.value: null,
                installation: installationPriceElement ? installationPriceElement.value: null,
                total_price: totalPriceElement ? totalPriceElement.value: null
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
        const response = await fetch('/api/saveboq', {
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