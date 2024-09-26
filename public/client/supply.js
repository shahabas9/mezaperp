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

    cell1.innerHTML = '<select name="Type[]" onchange="updateModelOptions(this)"><option value="ducted split Unit">Ducted Split Unit</option><option value="wall mounted split units">Wall Mounted Split Units</option><option value="floorstand">Floor Stand</option><option value="cassette">Cassette</option><option value="vrf indoor units">VRF Indoor Units</option><option value="vrf outdoor units">VRF Outdoor Units</option><option value="air curtain">Air Curtain</option></select>';
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

    if (typeValue === 'ducted split units') {
        modelSelect.innerHTML = `
            <option value="PEY-P18JA / SUY-P18">PEY-P18JA / SUY-P18</option>
            <option value="PEY-P24JA / SUY-P24">PEY-P24JA / SUY-P24</option>
            <option value="PEY-P30JA / SUY-P30">PEY-P30JA / SUY-P30</option>
            <option value="PEY-P36JA / SUY-P36">PEY-P36JA / SUY-P36</option>
            <option value="PEY-P45JG / PUY-P45">PEY-P45JG / PUY-P45</option>
            <option value="PEY-P60GAG / PUY-P60">PEY-P60GAG / PUY-P60</option>
            <option value="PEV-P200 / PUV-P200">PEV-P200 / PUV-P200</option>
            <option value="PEV-P250 / PUV-P250">PEV-P250 / PUV-P250</option>
        `;
    } else if (typeValue === 'wall mounted split units') {
        modelSelect.innerHTML = `
            <option value="MS-GS13/ MU-GS13">MS-GS13/ MU-GS13</option>
            <option value="MS-GS18/ MU-GS18">MS-GS18/ MU-GS18</option>
            <option value="MS-GS24/ MU-GS24">MS-GS24/ MU-GS24</option>
            <option value="MS-GS30/ MU-GS30">MS-GS30/ MU-GS30</option>
            <option value="MS-GS36/ MU-GS36">MS-GS36/ MU-GS36</option>
        `;
    } else if (typeValue === 'cassette') {
        modelSelect.innerHTML = `
            <option value="PLY-P18 BLACM/SUY-P18VA">PLY-P18 BLACM/SUY-P18VA</option>
            <option value="PLY-P24 BLACM/SUY-P24VA">PLY-P24 BLACM/SUY-P24VA</option>
            <option value="PLY-P30 BLACM/SUY-P30VA">PLY-P30 BLACM/SUY-P30VA</option>
            <option value="PLY-P36 BLACM/SUY-P36VA">PLY-P36 BLACM/SUY-P36VA</option>
            <option value="PLY-P42 BLACM/SUY-P42VA">PLY-P42 BLACM/SUY-P42VA</option>
            <option value="PLY-P48 BLACM/SUY-P48VA">PLY-P48 BLACM/SUY-P48VA</option>
        `;
    } else if (typeValue === 'floorstand') {
        modelSelect.innerHTML = `
            <option value="PSA-RP71GA">PSA-RP71GA</option>
            <option value="PSA-RP100GA">PSA-RP100GA</option>
            <option value="PSA-RP125GA">PSA-RP125GA</option>
            <option value="PSA-RP140GA">PSA-RP140GA</option>
        `; 
    } else if (typeValue === 'package unit') {
        modelSelect.innerHTML = `
            <option value="PRC 200">PRC 200</option>
            <option value="PRC 250">PRC 250</option>
            <option value="PRC 300">PRC 300</option>
            <option value="PRC 400">PRC 400</option>
            <option value="PRC 500">PRC 500</option>
            <option value="PRC 600">PRC 600</option>
            <option value="PRC 900">PRC 900</option>
        `; 
    } else if (typeValue === 'air curtain') {
        modelSelect.innerHTML = `
            <option value="GK-2509 YSI (90 cm)">GK-2509 YSI (90 cm)</option>
            <option value="GK 3509 CS (90 cm)">GK 3509 CS (90 cm)</option>
            <option value="GK 2512 Y (120 cm)">GK 2512 Y (120 cm)</option>
            <option value="GK 3512 DS (120 cm)">GK 3512 DS (120 cm)</option>
            
        `; 
    } else if (typeValue === 'vrf indoor units') {
        modelSelect.innerHTML = `
            <option value="PEFY-P20VMAL-E">PEFY-P20VMAL-E</option>
            <option value="PEFY-P25VMAL-E">PEFY-P25VMAL-E</option>
            <option value="PEFY-P32VMAL-E">PEFY-P32VMAL-E</option>
            <option value="PEFY-P40VMAL-E">PEFY-P40VMAL-E</option>
            <option value="PEFY-P50VMAL-E">PEFY-P50VMAL-E</option>
            <option value="PEFY-P63VMAL-E">PEFY-P63VMAL-E</option>
            <option value="PEFY-P71VMAL-E">PEFY-P71VMAL-E</option>
            <option value="PEFY-P80VMAL-E">PEFY-P80VMAL-E</option>
            <option value="PEFY-P100VMAL-E">PEFY-P100VMAL-E</option>
            <option value="PEFY-P125VMAL-E">PEFY-P125VMAL-E</option>
            <option value="PEFY-P140VMAL-E">PEFY-P140VMAL-E</option>
            <option value="PEFY-P200VMHS-E">PEFY-P200VMHS-E</option>
            <option value="PEFY-P250VMHS-E">PEFY-P250VMHS-E</option>
        `;
    } else if (typeValue === 'vrf outdoor units') {
        modelSelect.innerHTML = `
            <option value="PUCY-P200YKA">PUCY-P200YKA</option>
            <option value="PUCY-P250YKA">PUCY-P250YKA</option>
            <option value="PUCY-P300YKA">PUCY-P300YKA</option>
            <option value="PUCY-P350YKA">PUCY-P350YKA</option>
            <option value="PUCY-P400YKA">PUCY-P400YKA</option>
            <option value="PUCY-P450YKA">PUCY-P450YKA</option>
            <option value="PUCY-P500YKA">PUCY-P500YKA</option>
            <option value="PUCY-P550YSKA">PUCY-P550YSKA</option>
            <option value="PUCY-P600YSKA">PUCY-P600YSKA</option>
            <option value="PUCY-P650YSKA">PUCY-P650YSKA</option>
            <option value="PUCY-P700YSKA">PUCY-P700YSKA</option>
            <option value="PUCY-P750YSKA">PUCY-P750YSKA</option>
            <option value="PUCY-P800YSKA">PUCY-P800YSKA</option>
            <option value="PUCY-P850YSKA">PUCY-P850YSKA</option>
            <option value="PUCY-P900YSKA">PUCY-P900YSKA</option>
            <option value="PUCY-P950YSKA">PUCY-P950YSKA</option>
            <option value="PUCY-P1000YSKA">PUCY-P1000YSKA</option>
            <option value="PUCY-P1050YSKA">PUCY-P1050YSKA</option>
            <option value="PUCY-P1100YSKA">PUCY-P1100YSKA</option>
            <option value="PUCY-P1150YSKA">PUCY-P1150YSKA</option>
            <option value="PUCY-P1200YSKA">PUCY-P1200YSKA</option>
            <option value="PUCY-P1250YSKA">PUCY-P1250YSKA</option>
            <option value="PUCY-P1300YSKA">PUCY-P1300YSKA</option>
            <option value="PUCY-P1350YSKA">PUCY-P1350YSKA</option>
            <option value="PUCY-P1400YSKA">PUCY-P1400YSKA</option>
            <option value="PUCY-P1450YSKA">PUCY-P1450YSKA</option>
            <option value="PUCY-P1500YSKA">PUCY-P1500YSKA</option>
        `; 
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
    } else if (typeValue === 'PLY-P18 BLACM/SUY-P18VA') {
        tonSelect.innerHTML = '<option value="1.5">1.5</option>';
    } else if (typeValue === 'PLY-P24 BLACM/SUY-P24VA') {
        tonSelect.innerHTML = '<option value="2.5">2.5</option>';
    } else if (typeValue === 'PLY-P30 BLACM/SUY-P30VA') {
        tonSelect.innerHTML = '<option value="2.75">2.75</option>';
    } else if (typeValue === 'PLY-P36 BLACM/SUY-P36VA') {
        tonSelect.innerHTML = '<option value="3">3</option>';
    } else if (typeValue === 'PLY-P42 BLACM/SUY-P42VA') {
        tonSelect.innerHTML = '<option value="4">4</option>';
    } else if (typeValue === 'PLY-P48 BLACM/SUY-P48VA') {
        tonSelect.innerHTML = '<option value="4.25">4.25</option>';
    } else if (typeValue === 'GK-2509 YSI (90 cm)') {
        tonSelect.innerHTML = '<option value="90">90</option>';
    } else if (typeValue === 'GK 3509 CS (90 cm)') {
        tonSelect.innerHTML = '<option value="90">90</option>';
    } else if (typeValue === 'GK 2512 Y (120 cm)') {
        tonSelect.innerHTML = '<option value="120">120</option>';
    }else if (typeValue === 'GK 3512 DS (120 cm)') {
        tonSelect.innerHTML = '<option value="120">120</option>';
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
    } else if (typeValue === 'PEFY-P20VMAL-E') {
        tonSelect.innerHTML = '<option value="2.2">2.2</option><option value="0.63">0.63</option>'; 
    } else if (typeValue === 'PEFY-P25VMAL-E') {
        tonSelect.innerHTML = '<option value="2.8">2.8</option><option value="0.80">0.80</option>'; 
    } else if (typeValue === 'PEFY-P32VMAL-E') {
        tonSelect.innerHTML = '<option value="3.6">3.6</option><option value="1.02">1.02</option>'; 
    } else if (typeValue === 'PEFY-P40VMAL-E') {
        tonSelect.innerHTML = '<option value="4.5">4.5</option><option value="1.28">1.28</option>'; 
    } else if (typeValue === 'PEFY-P50VMAL-E') {
        tonSelect.innerHTML = '<option value="5.6">5.6</option><option value="1.59">1.59</option>'; 
    } else if (typeValue === 'PEFY-P63VMAL-E') {
        tonSelect.innerHTML = '<option value="7.1">7.1</option><option value="2.02">2.02</option>'; 
    } else if (typeValue === 'PEFY-P71VMAL-E') {
        tonSelect.innerHTML = '<option value="8">8</option><option value="2.27">2.27</option>'; 
    } else if (typeValue === 'PEFY-P80VMAL-E') {
        tonSelect.innerHTML = '<option value="9">9</option><option value="2.56">2.56</option>'; 
    } else if (typeValue === 'PEFY-P100VMAL-E') {
        tonSelect.innerHTML = '<option value="11.2">11.2</option><option value="3.18">3.18</option>'; 
    } else if (typeValue === 'PEFY-P125VMAL-E') {
        tonSelect.innerHTML = '<option value="14">14</option><option value="3.98">3.98</option>'; 
    } else if (typeValue === 'PEFY-P140VMAL-E') {
        tonSelect.innerHTML = '<option value="16">16</option><option value="4.55">4.55</option>'; 
    } else if (typeValue === 'PEFY-P200VMHS-E') {
        tonSelect.innerHTML = '<option value="22.24">22.24</option><option value="6.37">6.37</option>'; 
    } else if (typeValue === 'PEFY-P250VMHS-E') {
        tonSelect.innerHTML = '<option value="28">28</option><option value="7.96">7.96</option>'; 
    } else if (typeValue === 'PUCY-P200YKA') {
        tonSelect.innerHTML = '<option value="22.24">22.24</option><option value="6.37">6.37</option>'; 
    } else if (typeValue === 'PUCY-P250YKA') {
        tonSelect.innerHTML = '<option value="28">28</option><option value="7.96">7.96</option>'; 
    } else if (typeValue === 'PUCY-P300YKA') {
        tonSelect.innerHTML = '<option value="33.5">33.5</option><option value="9.53">9.53</option>'; 
    } else if (typeValue === 'PUCY-P350YKA') {
        tonSelect.innerHTML = '<option value="40">40</option><option value="11.37">11.37</option>'; 
    } else if (typeValue === 'PUCY-P400YKA') {
        tonSelect.innerHTML = '<option value="44">44</option><option value="12.51">12.51</option>'; 
    } else if (typeValue === 'PUCY-P450YKA') {
        tonSelect.innerHTML = '<option value="48">48</option><option value="13.65">13.65</option>'; 
    } else if (typeValue === 'PUCY-P500YKA') {
        tonSelect.innerHTML = '<option value="56">56</option><option value="15.92">15.92</option>'; 
    } else if (typeValue === 'PUCY-P550YSKA') {
        tonSelect.innerHTML = '<option value="61.5">61.5</option><option value="17.49">17.49</option>'; 
    } else if (typeValue === 'PUCY-P600YSKA') {
        tonSelect.innerHTML = '<option value="68">68</option><option value="19.34">19.34</option>'; 
    } else if (typeValue === 'PUCY-P650YSKA') {
        tonSelect.innerHTML = '<option value="72">72</option><option value="20.47">20.47</option>'; 
    } else if (typeValue === 'PUCY-P700YSKA') {
        tonSelect.innerHTML = '<option value="76">76</option><option value="21.61">21.61</option>'; 
    } else if (typeValue === 'PUCY-P750YSKA') {
        tonSelect.innerHTML = '<option value="81.5">81.5</option><option value="23.17">23.17</option>'; 
    } else if (typeValue === 'PUCY-P800YSKA') {
        tonSelect.innerHTML = '<option value="88">88</option><option value="25.02">25.02</option>'; 
    } else if (typeValue === 'PUCY-P850YSKA') {
        tonSelect.innerHTML = '<option value="92">92</option><option value="26.16">26.16</option>'; 
    } else if (typeValue === 'PUCY-P900YSKA') {
        tonSelect.innerHTML = '<option value="96">96</option><option value="27.30">27.30</option>'; 
    } else if (typeValue === 'PUCY-P950YSKA') {
        tonSelect.innerHTML = '<option value="104">104</option><option value="29.57">29.57</option>'; 
    } else if (typeValue === 'PUCY-P1000YSKA') {
        tonSelect.innerHTML = '<option value="112">112</option><option value="31.85">31.85</option>'; 
    } else if (typeValue === 'PUCY-P1050YSKA') {
        tonSelect.innerHTML = '<option value="115">115</option><option value="32.70">32.70</option>'; 
    } else if (typeValue === 'PUCY-P1100YSKA') {
        tonSelect.innerHTML = '<option value="121.5">121.5</option><option value="34.55">34.55</option>'; 
    } else if (typeValue === 'PUCY-P1150YSKA') {
        tonSelect.innerHTML = '<option value="128">128</option><option value="36.40">36.40</option>'; 
    } else if (typeValue === 'PUCY-P1200YSKA') {
        tonSelect.innerHTML = '<option value="132">132</option><option value="37.53">37.53</option>'; 
    } else if (typeValue === 'PUCY-P1250YSKA') {
        tonSelect.innerHTML = '<option value="136">136</option><option value="38.67">38.67</option>'; 
    } else if (typeValue === 'PUCY-P1300YSKA') {
        tonSelect.innerHTML = '<option value="140">140</option><option value="39.81">39.81</option>'; 
    } else if (typeValue === 'PUCY-P1350YSKA') {
        tonSelect.innerHTML = '<option value="144">144</option><option value="40.95">40.95</option>'; 
    } else if (typeValue === 'PUCY-P1400YSKA') {
        tonSelect.innerHTML = '<option value="152">152</option><option value="43.22">43.22</option>'; 
    } else if (typeValue === 'PUCY-P1450YSKA') {
        tonSelect.innerHTML = '<option value="160">160</option><option value="45.50">45.50</option>'; 
    } else if (typeValue === 'PUCY-P1500YSKA') {
        tonSelect.innerHTML = '<option value="168">168</option><option value="47.77">47.77</option>'; 
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

// Fetch and populate the customer dropdown on page load
async function initializeDataOptions() {
    try {
        const response = await fetch('/api/customers');
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
      const response = await fetch(`/api/quotations/${customerId}`);
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

        // Redirect to customer_project.html after successful submission
        window.location.href = 'customer_project.html';
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit data');
    }
}


function goBack() {
    window.history.back();
}
$(document).ready(function() {
    $('#customer').select2({
      placeholder: 'Search for a customer',
      allowClear: true
    });
  
    // Load the customer data and populate the dropdown
    initializeDataOptions();
  });

  