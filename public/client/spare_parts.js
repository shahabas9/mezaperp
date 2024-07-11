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
    

    cell1.innerHTML = '<select name="Type[]" onchange="updateModelOptions(this)"><option value="Compressor">Compressor</option><option value="INVERTER PCB">INVERTER PCB</option><option value="Wireless Remote">Wireless Remote</option><option value="Outdoor Motor Rewinding">Outdoor Motor Rewinding</option><option value="Outdoor Motor Bearing">Outdoor Motor Bearing</option><option value="Outdoor Motor Brush">Outdoor Motor Brush</option><option value="Filter Drier">Filter Drier</option><option value="Splite AC Blade">Splite AC Blade</option><option value="Contractor">Contractor</option><option value="Fan Belt">Fan Belt</option><option value="Fan Motor Rewinding">Fan Motor Rewinding</option><option value="PCB Board">PCB Board</option><option value="Exhaust Fan">Exhaust Fan</option><option value="Motor for Duct Split Unit">Motor for Duct Split Unit</option><option value="Propeller Fan for Duct Split Unit">Propeller Fan for Duct Split Unit</option>';
    cell2.innerHTML = '<select name="Model[]"></select>';
    cell3.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';
    cell4.innerHTML = '<input type="number" name="Unit Price[]" oninput="updateTotal(this)">';
    cell5.innerHTML = '<input type="number" name="Total Price[]" readonly>';
    cell6.innerHTML = '<button onclick="addRow(this)">+</button> <button onclick="deleteRow(this)">-</button>';

    // Initialize Model options based on the default Type value
    updateModelOptions(newRow.querySelector('select[name="Type[]"]'));
    

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

async function initializeDataOptions() {
    try {
      const response = await fetch('/api/customers_sp');
      const customers = await response.json();

      populateDropdown('customer', customers, 'customer_id', 'customer_name');

      const customerDropdown = document.getElementById('customer');

      // Add event listener to the customer dropdown
      customerDropdown.addEventListener('change', updateQuotationDropdown);

      // Trigger change event to populate the quotation dropdown
      if (customerDropdown.options.length > 0) {
        customerDropdown.selectedIndex = 0; // Select the first customer by default
        customerDropdown.dispatchEvent(new Event('change'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function updateQuotationDropdown() {
    const customerId = this.value;
    try {
      const response = await fetch(`/api/quotations_sp/${customerId}`);
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

  function filterCustomers() {
    const searchInput = document.getElementById('customerSearch');
    const filter = searchInput.value.toUpperCase();
    const dropdown = document.getElementById('customer');
    const options = dropdown.getElementsByTagName('option');

    for (let i = 0; i < options.length; i++) {
      const customerName = options[i].text.toUpperCase();
      if (customerName.includes(filter)) {
        options[i].style.display = '';
      } else {
        options[i].style.display = 'none';
      }
    }
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
                type: typeElement.value,
                model: modelElement.value,
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
        const response = await fetch('/api/spare', {
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