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
    
    cell1.innerHTML = '<select name="Type[]"><option value="ducted split units">Ducted Split Units</option><option value="wall mounted split units">Wall Mounted Split Units</option><option value="cassette">Cassette</option><option value="floor stand">Floor Stand</option><option value="package units">Package Units</option></select>';
    cell2.innerHTML = '<input type="number" name="Quantity[]">';
    cell3.innerHTML = '<button type="button" onclick="addRow(this)">+</button> <button type="button" onclick="deleteRow(this)">-</button>';
    
    updateButtons();
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
      const response = await fetch('/api/customers_amc');
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
      const response = await fetch(`/api/quotations_amc/${customerId}`);
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
        window.location.href = 'customer_project.html';
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit data');
    }
}
function goBack() {
    window.history.back();
}