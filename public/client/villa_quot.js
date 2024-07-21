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

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    var cell5 = newRow.insertCell(4);
    var cell6 = newRow.insertCell(5);

    cell1.innerHTML = '<select name="Location[]"><option value="Ground Floor">Ground Floor</option><option value="First Floor">First Floor</option><option value="Basement">Basement</option><option value="Mezzanine">Mezzanine</option><option value="Penthouse">Penthouse</option><option value="Out Majlis">Out Majlis</option><option value="Out Kitchen">Out Kitchen</option><option value="Outblock">Outblock</option></select>';
    cell2.innerHTML = '<input type="text" name="Serving Area[]">';
    cell3.innerHTML = '<select name="Type[]" onchange="updateTonOptions(this)"><option value="ducted split">Ducted Split</option><option value="wall mounted">Wall Mounted</option><option value="cassette">Cassette</option><option value="floor stand">Floor Stand</option><option value="package units">Package Unit</option></select>';
    cell4.innerHTML = '<select name="TON[]"></select>';
    cell5.innerHTML = '<input type="number" name="Quantity[]">';
    cell6.innerHTML = '<button type="button" onclick="addRow(this)">+</button> <button type="button" onclick="deleteRow(this)">-</button>';

    // Initialize TON options based on the default Type value
    updateTonOptions(newRow.querySelector('select[name="Type[]"]'));
    
    updateButtons();
}

function updateTonOptions(selectElement) {
    var tonSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="TON[]"]');
    var typeValue = selectElement.value;
    
    tonSelect.innerHTML = ''; // Clear existing options

    if (typeValue === 'ducted split') {
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
    } else if (typeValue === 'wall mounted') {
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

async function initializeDataOptions() {
    try {
        const response = await fetch('/api/customers_vi');
        const customers = await response.json();
        
        // Populate customer dropdown and set default value
        populateDropdown('customer', customers, 'customer_id', 'customer_name');
        
        const customerDropdown = document.getElementById('customer');
        
        // Add event listener to the customer dropdown
        customerDropdown.addEventListener('change', updateQuotationDropdown);
        
        // Trigger change event to populate the quotation dropdown
        if (customerDropdown.options.length > 0) {
            customerDropdown.selectedIndex = 0;  // Select the first customer by default
            customerDropdown.dispatchEvent(new Event('change'));
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function updateQuotationDropdown() {
    const customerId = this.value;
    try {
        const response = await fetch(`/api/quotations_vi/${customerId}`);
        const quotations = await response.json();
        console.log('Quotations fetched:', quotations); // Debugging log
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

// Initialize data when the window loads
window.onload = initializeDataOptions;


async function handleSubmit(event) {
    event.preventDefault();

    const customerId = document.getElementById('customer').value;
    const quotationId = document.getElementById('quotation').value;
    const tableRows = document.querySelectorAll('#supplyInstTable tbody tr'); // Changed the selector here

    const villaData = [];

    tableRows.forEach((row, index) => {
        const locationElement = row.querySelector('select[name="Location[]"]');
        const areaElement = row.querySelector('input[name="Serving Area[]"]');
        const typeElement = row.querySelector('select[name="Type[]"]');
        const tonElement = row.querySelector('select[name="TON[]"]');
        const quantityElement = row.querySelector('input[name="Quantity[]"]');
        

        // Debugging output
        console.log(`Row ${index}:`, {
            locationElement,
            areaElement,
            typeElement,
            tonElement,
            quantityElement
        });

        // Ensure all elements are found before accessing their values
        if (locationElement && areaElement && typeElement && tonElement && quantityElement ) {
            villaData.push({
                location: locationElement.value,
                area: areaElement.value,
                type: typeElement.value,
                ton: tonElement.value,
                quantity: quantityElement.value
            });
        } else {
            console.error(`Error: Missing elements in row ${index}`);
        }
    });

    const payload = {
        customer_id: customerId,
        quotation_id: quotationId,
        supply_data: villaData
    };

    console.log('Submitting payload:', payload); // Debugging output

    try {
        const response = await fetch('/api/villa', {
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
