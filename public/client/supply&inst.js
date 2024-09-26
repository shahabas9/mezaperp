function updateButtons() {
    var rows = document.querySelectorAll('#supplyInstTable tbody tr');
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
    var table = document.getElementById("supplyInstTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    var cell1 = newRow.insertCell(0); // Type (dropdown or manual input)
    var cell2 = newRow.insertCell(1); // TON (dropdown or manual input)
    var cell3 = newRow.insertCell(2); // Quantity
    var cell4 = newRow.insertCell(3); // Unit Price
    var cell5 = newRow.insertCell(4); // Total Price
    var cell6 = newRow.insertCell(5); // Buttons for add/delete

    // First column (Type): Toggle between dropdown or manual input
    cell1.innerHTML = `
        <label><input type="radio" name="typeToggle${table.rows.length}" onclick="toggleTypeInput(this, 'dropdown')" checked> Dropdown</label>
        <label><input type="radio" name="typeToggle${table.rows.length}" onclick="toggleTypeInput(this, 'manual')"> Manual</label>
        <br>
        <select name="Type[]" onchange="updateTonOptions(this)" style="display:block;">
            <option value="ducted split units">Ducted Split Units</option>
            <option value="wall mounted split units">Wall Mounted Split Units</option>
            <option value="cassette">Cassette</option>
            <option value="floor stand">Floor Stand</option>
            <option value="package units">Package Units</option>
            <option value="VRF ceiling concealed">VRF Ceiling Concealed</option>
            <option value="vrf outdoor units">VRF Outdoor Units</option>
            <option value="Fan">Fan</option>
        </select>
        <input type="text" name="TypeManual[]" style="display:none;" placeholder="Enter type manually">
    `;

    // Second column (TON): Toggle between dropdown or manual input
    cell2.innerHTML = `
        <label><input type="radio" name="tonToggle${table.rows.length}" onclick="toggleTonInput(this, 'dropdown')" checked> Dropdown</label>
        <label><input type="radio" name="tonToggle${table.rows.length}" onclick="toggleTonInput(this, 'manual')"> Manual</label>
        <br>
        <select name="TON[]" style="display:block;"></select>
        <input type="text" name="TONManual[]" style="display:none;" placeholder="Enter ton manually">
    `;

    // Initialize TON options based on the default Type value
    updateTonOptions(newRow.querySelector('select[name="Type[]"]'));

    // Quantity input
    cell3.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';

    // Unit Price input
    cell4.innerHTML = '<input type="number" name="Unit Price[]" oninput="updateTotal(this)">';

    // Total Price input (readonly)
    cell5.innerHTML = '<input type="number" name="Total Price[]" readonly>';

    // Add/Delete buttons
    cell6.innerHTML = '<button type="button" onclick="addRow(this)">+</button> <button type="button" onclick="deleteRow(this)">-</button>';
}

// Function to toggle between dropdown and manual input for Type
function toggleTypeInput(radio, mode) {
    const row = radio.closest('tr');
    const dropdown = row.querySelector('select[name="Type[]"]');
    const manualInput = row.querySelector('input[name="TypeManual[]"]');

    if (mode === 'dropdown') {
        dropdown.style.display = 'block';
        manualInput.style.display = 'none';
        updateTonOptions(dropdown);  // Ensure TON options are updated when switching to dropdown
    } else {
        dropdown.style.display = 'none';
        manualInput.style.display = 'block';
    }
}

// Function to toggle between dropdown and manual input for TON
function toggleTonInput(radio, mode) {
    const row = radio.closest('tr');
    const dropdown = row.querySelector('select[name="TON[]"]');
    const manualInput = row.querySelector('input[name="TONManual[]"]');

    if (mode === 'dropdown') {
        dropdown.style.display = 'block';
        manualInput.style.display = 'none';
    } else {
        dropdown.style.display = 'none';
        manualInput.style.display = 'block';
    }
}



function updateTonOptions(selectElement) {
    var tonSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="TON[]"]');
    var typeValue = selectElement.value;
    
    tonSelect.innerHTML = ''; // Clear existing options

    if (typeValue === 'ducted split units') {
        tonSelect.innerHTML = `
            <option value="1.5">1.5</option>
            <option value="2.5">2.5</option>
            <option value="2.75">2.75</option>
            <option value="3">3</option>
            <option value="4.26">4.26</option>
            <option value="5">5</option>
            <option value="6.66">6.66</option>
            <option value="8.33">8.33</option>
        `;
    } else if (typeValue === 'wall mounted split units') {
        tonSelect.innerHTML = `
            <option value="1">1</option>
            <option value="1.5">1.5</option>
            <option value="2">2</option>
            <option value="2.5">2.5</option>
            <option value="3">3</option>
        `;
    } else if (typeValue === 'cassette') {
        tonSelect.innerHTML = `
            <option value="1.5">1.5</option>
            <option value="2.5">2.5</option>
            <option value="2.75">2.75</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="4.25">4.25</option>
        `;
    } else if (typeValue === 'floor stand') {
        tonSelect.innerHTML = `
            <option value="2.3">2.3</option>
            <option value="3.25">3.25</option>
            <option value="4">4</option>
            <option value="4.35">4.35</option>
        `;
    } else if (typeValue === 'package units') {
        tonSelect.innerHTML = `
            <option value="6.8">6.8</option>
            <option value="9.1">9.1</option>
            <option value="10">10</option>
            <option value="13.65">13.65</option>
            <option value="18.2">18.2</option>
            <option value="20">20</option>
            <option value="28.5">28.5</option>
        `;
    }  else if (typeValue === 'VRF ceiling concealed') {
        tonSelect.innerHTML = `
            <option value="0.63">0.63</option>
            <option value="0.80">0.80</option>
            <option value="1.02">1.02</option>
            <option value="1.28">1.28</option>
            <option value="1.59">1.59</option>
            <option value="2.02">2.02</option>
            <option value="2.27">2.27</option>
            <option value="2.56">2.56</option>
            <option value="3.18">3.18</option>
            <option value="3.98">3.98</option>
            <option value="4.55">4.55</option>
            <option value="6.37">6.37</option>
            <option value="7.96">7.96</option>
        `;
    } else if (typeValue === 'VRF outdoor') {
        tonSelect.innerHTML = `
            <option value="6.37">6.37</option>
            <option value="7.96">7.96</option>
            <option value="9.53">9.53</option>
            <option value="11.37">11.37</option>
            <option value="12.51">12.51</option>
            <option value="13.65">13.65</option>
            <option value="15.92">15.92</option>
            <option value="17.49">17.49</option>
            <option value="19.34">19.34</option>
            <option value="20.47">20.47</option>
            <option value="21.61">21.61</option>
            <option value="23.17">23.17</option>
            <option value="25.02">25.02</option>
            <option value="26.16">26.16</option>
            <option value="27.30">27.30</option>
            <option value="29.57">29.57</option>
            <option value="31.85">31.85</option>
            <option value="32.70">32.70</option>
            <option value="34.55">34.55</option>
            <option value="36.40">36.40</option>
            <option value="37.53">37.53</option>
            <option value="38.67">38.67</option>
            <option value="39.81">39.81</option>
            <option value="40.95">40.95</option>
            <option value="43.22">43.22</option>
            <option value="45.50">45.50</option>
            <option value="47.77">47.77</option>
        `;
    } else if (typeValue === 'Fan') {
        tonSelect.innerHTML = `
            <option value="VD-15">VD-15</option>
            <option value="VD-10">VD-10</option>
            <option value="lineo-100QVO">lineo-100QVO</option>
            <option value="CA-100MD">CA-100MD</option> 
        `;
    } else {
        // Add default or other specific options based on type if necessary
        tonSelect.innerHTML = '<option value="Select TON">Select TON</option>';
    }
}

function initializeTonOptions() {
    var rows = document.querySelectorAll('#supplyInstTable tbody tr');
    rows.forEach(function(row, index) {
        var typeSelect = row.querySelector('select[name="Type[]"]');
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
    
    totalInput.value = (unitPrice * quantity); // Calculate and set the total tonnage
}
$(document).ready(function() {
    $('#customer').select2({
      placeholder: 'Search for a customer',
      allowClear: true
    });
  
    // Load the customer data and populate the dropdown
    initializeDataOptions();
  });
async function initializeDataOptions() {
    try {
      const response = await fetch('/api/customers_si');
      const customers = await response.json();
        console.log('Customers (Before Sorting):', customers);

        // Sort customers by customer_id in descending order
        customers.sort((a, b) => b.customer_id - a.customer_id);
        console.log('Customers (After Sorting):', customers);

        populateDropdown('customer', customers, 'customer_id', 'customer_name');

        const customerDropdown = $('#customer');

        // Trigger change event to populate the quotation dropdown
        if (customerDropdown.find('option').length > 0) {
            customerDropdown.val(customerDropdown.find('option:first').val()).trigger('change');
        }

        // Add event listener to the customer dropdown
        customerDropdown.on('change', updateQuotationDropdown);
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

async function updateQuotationDropdown() {
    const customerId = this.value;
    try {
      const response = await fetch(`/api/quotations_si/${customerId}`);
      const quotations = await response.json();
      console.log('Quotations:', quotations);
  
      populateDropdown('quotation', quotations, 'quotation_id', 'quotation_id');
    } catch (error) {
      console.error('Error fetching quotations:', error);
    }
  }

function populateDropdown(dropdownId, items, valueKey, textKey) {
    const dropdown = $(`#${dropdownId}`);
    dropdown.empty(); // Clear existing options
  
    items.forEach(item => {
      dropdown.append(new Option(item[textKey], item[valueKey]));
    });
  
    dropdown.trigger('change'); // Refresh the dropdown with Select2
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

// Initialize data when the window loads
window.onload = initializeDataOptions;


async function handleSubmit(event) {
    event.preventDefault();
    
    // Show confirmation dialog
    const confirmation = confirm("Are you sure you want to submit the supply data?");
    
    // If the user clicks "No" (Cancel), stop further execution
    if (!confirmation) {
        return;
    }

    const customerId = document.getElementById('customer').value;
    const quotationId = document.getElementById('quotation').value;
    const tableRows = document.querySelectorAll('#supplyInstTable tbody tr'); 

    const supply_instData = [];

    tableRows.forEach((row, index) => {
        // Safely get the Type elements
        const typeElement = row.querySelector('select[name="Type[]"]');
        const typeManualElement = row.querySelector('input[name="TypeManual[]"]');
        
        // Determine the type value (manual input or dropdown)
        let typeValue = '';
        if (typeManualElement && typeManualElement.style.display !== 'none' && typeManualElement.value) {
            typeValue = typeManualElement.value;  // Manual input is used
        } else if (typeElement) {
            typeValue = typeElement.value;  // Dropdown is used
        }

        // Safely get the TON elements
        const tonElement = row.querySelector('select[name="TON[]"]');
        const tonManualElement = row.querySelector('input[name="TONManual[]"]');
        
        // Determine the TON value (manual input or dropdown)
        let tonValue = '';
        if (tonManualElement && tonManualElement.style.display !== 'none' && tonManualElement.value) {
            tonValue = tonManualElement.value;  // Manual input is used
        } else if (tonElement) {
            tonValue = tonElement.value;  // Dropdown is used
        }

        const quantityElement = row.querySelector('input[name="Quantity[]"]');
        const unitPriceElement = row.querySelector('input[name="Unit Price[]"]');
        const totalPriceElement = row.querySelector('input[name="Total Price[]"]');

        // Ensure all essential elements are found before accessing their values
        if (quantityElement && unitPriceElement && totalPriceElement) {
            supply_instData.push({
                type: typeValue || '',  // Default to empty if null
                ton: tonValue || '',    // Default to empty if null
                quantity: quantityElement.value || 0,
                unit_price: unitPriceElement.value || 0,
                total_price: totalPriceElement.value || 0
            });
        } else {
            console.error(`Error: Missing elements in row ${index}`);
        }
    });

    const payload = {
        customer_id: customerId,
        quotation_id: quotationId,
        supply_data: supply_instData
    };

    console.log('Submitting payload:', payload); // Debugging output

    try {
        const response = await fetch('/api/supply_si', {
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
        window.location.href = 'customer_project.html';
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit data');
    }
}



function goBack() {
    window.history.back();
}