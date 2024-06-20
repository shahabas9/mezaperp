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

function addRow(button) {
    var table = document.getElementById("supplyTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    var cell5 = newRow.insertCell(4);
    var cell6 = newRow.insertCell(5);
    var cell7 = newRow.insertCell(6);

    cell1.innerHTML = '<select name="Type[]" onchange="updateModelOptions(this)"><option value="duct split">Duct Split</option><option value="split">Split</option><option value="vrf">VRF</option></select>';
    cell2.innerHTML = '<select name="Model Inoor/Outdoor[]" onchange="updateTonOptions(this)"></select>';
    cell3.innerHTML = '<select name="TON[]"></select>';
    cell4.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';
    cell5.innerHTML = '<input type="number" name="Unit Price[]" oninput="updateTotal(this)">';
    cell6.innerHTML = '<input type="number" name="Total Price[]" readonly>';
    cell7.innerHTML = '<button onclick="addRow(this)">+</button> <button onclick="deleteRow(this)">-</button>';

    // Initialize TON options based on the default Type value
    updateModelOptions(newRow.querySelector('select[name="Type[]"]'));
    updateTonOptions(newRow.querySelector('select[name="Model Inoor/Outdoor[]"]'));

    updateButtons();
}

function updateModelOptions(selectElement) {
    var modelSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="Model Inoor/Outdoor[]"]');
    var typeValue = selectElement.value;
    
    modelSelect.innerHTML = ''; // Clear existing options

    if (typeValue === 'duct split') {
        modelSelect.innerHTML = '<option value="PEY-P18JA / SUY-P18">PEY-P18JA / SUY-P18</option><option value="PEY-P24JA / SUY-P24">PEY-P24JA / SUY-P24</option><option value="PEY-P30JA / SUY-P30">PEY-P30JA / SUY-P30</option><option value="PEY-P36JA / SUY-P36">PEY-P36JA / SUY-P36</option><option value="PEY-P45JG / PUY-P45">PEY-P45JG / PUY-P45</option><option value="PEY-P60GAG / PUY-P60">PEY-P60GAG / PUY-P60</option><option value="PEV-P200 / PUV-P200">PEV-P200 / PUV-P200</option><option value="PEV-P250 / PUV-P250">PEV-P250 / PUV-P250</option>';
    } else if (typeValue === 'split') {
        modelSelect.innerHTML = '<option value="MS-GS13/ MU-GS13">MS-GS13/ MU-GS13</option><option value="MS-GS18/ MU-GS18">MS-GS18/ MU-GS18</option><option value="MS-GS24/ MU-GS24">MS-GS24/ MU-GS24</option><option value="MS-GS30/ MU-GS30">MS-GS30/ MU-GS30</option><option value="MS-GS36/ MU-GS36">MS-GS36/ MU-GS36</option>';
    } else if (typeValue === 'vrf') {
        modelSelect.innerHTML = '<option value="6.8">6.8</option><option value="9.1">9.1</option><option value="10">10</option><option value="13.65">13.65</option><option value="18.2">18.2</option><option value="20">20</option>';
    } else {
        // Add default or other specific options based on type if necessary
        modelSelect.innerHTML = '<option value="Select Model">Select Model</option>';
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

function updateTotal(element) {
    var row = element.parentNode.parentNode;
    var quantityInput = row.querySelector('input[name="Quantity[]"]');
    var priceInput = row.querySelector('input[name="Unit Price[]"]');
    var totalInput = row.querySelector('input[name="Total Price[]"]');
    
    var unitPrice = parseFloat(priceInput.value) || 0;
    var quantity = parseFloat(quantityInput.value) || 0;
    
    totalInput.value = (unitPrice * quantity).toFixed(2); // Calculate and set the total tonnage
}

async function initializeDataOptions() {
    try {
      const response = await fetch('/api/customers');
      const customers = await response.json();
  
      populateDropdown('customer', customers, 'customer_id', 'customer_name');
  
      document.getElementById('customer').addEventListener('change', updateQuotationDropdown);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  async function updateQuotationDropdown() {
    const customerId = this.value;
    try {
      const response = await fetch(`/api/quotations/${customerId}`);
      const quotations = await response.json();
  
      populateDropdown('quotation', quotations, 'quotation_id', 'quotation_id');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  function populateDropdown(dropdownId, items, valueKey, textKey) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = ''; // Clear existing options
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item[valueKey];
      option.text = item[textKey];
      dropdown.add(option);
    });
  }
  
  window.onload = initializeDataOptions;

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

        // Debugging output
        console.log(`Row ${index}:`, {
            typeElement,
            modelElement,
            tonElement,
            quantityElement,
            unitPriceElement,
            totalPriceElement
        });

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
        customer_id: customerId,
        quotation_id: quotationId,
        supply_data: supplyData
    };

    console.log('Submitting payload:', payload); // Debugging output

    try {
        const response = await fetch('/api/supply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        alert('Data submitted successfully');
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit data');
    }
}

  