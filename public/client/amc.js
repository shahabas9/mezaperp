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
    
    cell1.innerHTML = '<select name="Type[]"><option value="ducted split">Ducted Split Units</option><option value="wall mounted">Wall Mounted Split Units</option><option value="cassette">Cassette</option><option value="floor stand">Floor Stand</option><option value="package units">Package Units</option></select>';
    cell2.innerHTML = '<input type="number" name="Quantity[]">';
    cell3.innerHTML = '<button type="button" onclick="addRow(this)">+</button> <button type="button" onclick="deleteRow(this)">-</button>';
    
    updateButtons();
}

async function initializeDataOptions() {
    try {
        const response = await fetch('/api/customers_amc');
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
        const response = await fetch(`/api/quotations_amc/${customerId}`);
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

    const amcData = [];

    tableRows.forEach((row, index) => {
        const typeElement = row.querySelector('select[name="Type[]"]');
        const quantityElement = row.querySelector('input[name="Quantity[]"]');
        

        // Debugging output
        console.log(`Row ${index}:`, {
            
            typeElement,
           
            quantityElement
        });

        // Ensure all elements are found before accessing their values
        if ( typeElement && quantityElement ) {
            amcData.push({
                
                type: typeElement.value,
                
                quantity: quantityElement.value
            });
        } else {
            console.error(`Error: Missing elements in row ${index}`);
        }
    });

    const payload = {
        customer_id: customerId,
        quotation_id: quotationId,
        supply_data: amcData
    };

    console.log('Submitting payload:', payload); // Debugging output

    try {
        const response = await fetch('/api/amc', {
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