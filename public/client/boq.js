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
    
    cell1.innerHTML = '<input type="number" name="supply_cost[]" oninput="updateTotal(this)">';
    cell2.innerHTML = '<input type="number" name="installation_cost[]" oninput="updateTotal(this)">';
    cell3.innerHTML = '<input type="number" name="total_amount[]" readonly>';
    cell4.innerHTML = '<button onclick="addRow(this)">+</button> <button onclick="deleteRow(this)">-</button>';

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

async function initializeDataOptions() {
    try {
      const response = await fetch('/api/customers_boq');
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
      const response = await fetch(`/api/quotations_boq/${customerId}`);
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

    const boqData = [];

    tableRows.forEach((row, index) => {
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
            boqData.push({
            
                supply: supplyElement.value,
                installation: installationPriceElement.value,
                total_price: totalPriceElement.value
            });
        } else {
            console.error(`Error: Missing elements in row ${index}`);
        }
    });

    const payload = {
        customer_id: customerId,
        quotation_id: quotationId,
        supply_data: boqData
    };

    console.log('Submitting payload:', payload); // Debugging output

    try {
        const response = await fetch('/api/boq', {
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