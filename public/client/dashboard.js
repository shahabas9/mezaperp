function updateTotal(element) {
    var row = element.parentNode.parentNode;
    var tonInput = row.querySelector('select[name="TON[]"]');
    var quantityInput = row.querySelector('input[name="Quantity[]"]');
    var totalInput = row.querySelector('input[name="Total TON[]"]');
    
    var ton = parseFloat(tonInput.value) || 0;
    var quantity = parseFloat(quantityInput.value) || 0;
    
    totalInput.value = (ton * quantity).toFixed(2); // Calculate and set the total tonnage
}

function addRow(button) {
    var table = document.getElementById("customerTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    var cell5 = newRow.insertCell(4);
    var cell6 = newRow.insertCell(5);
    var cell7 = newRow.insertCell(6);

    cell1.innerHTML = '<select name="Location[]"><option value="ground floor">Ground Floor</option><option value="basement">Basement</option><option value="first floor">First Floor</option><option value="second floor">Second Floor</option><option value="third floor">Third Floor</option><option value="penthouse">Penthouse</option><option value="outblock">Outblock</option></select>';
    cell2.innerHTML = '<input type="text" name="Area[]">';
    cell3.innerHTML = '<select name="Type[]" onchange="updateTonOptions(this)"><option value="duct">Duct</option><option value="duct split">Duct Split</option><option value="split">Split</option></select>';
    cell4.innerHTML = '<select name="TON[]"></select>';
    cell5.innerHTML = '<input type="number" name="Quantity[]" oninput="updateTotal(this)">';
    cell6.innerHTML = '<input type="number" name="Total TON[]" readonly>';
    cell7.innerHTML = '<button onclick="addRow(this)">+</button> <button onclick="deleteRow(this)">-</button>';

    // Initialize TON options based on the default Type value
    updateTonOptions(newRow.querySelector('select[name="Type[]"]'));


    var rows = table.getElementsByTagName('tr');
    for (var i = 0; i < rows.length - 1; i++) {
        rows[i].cells[6].innerHTML = '';
    }
    updateButtons();
}




function updateTonOptions(selectElement) {
    var tonSelect = selectElement.parentNode.nextElementSibling.querySelector('select[name="TON[]"]');
    var typeValue = selectElement.value;
    
    tonSelect.innerHTML = ''; // Clear existing options

    if (typeValue === 'split') {
        tonSelect.innerHTML = '<option value="1">1</option><option value="1.5">1.5</option><option value="2">2</option><option value="2.5">2.5</option><option value="3">3</option>';
    } else if (typeValue === 'duct split') {
        tonSelect.innerHTML = '<option value="1.5">1.5</option><option value="2.5">2.5</option><option value="2.75">2.75</option><option value="3">3</option><option value="4.26">4.26</option><option value="5">5</option><option value="6.66">6.66</option><option value="8.33">8.33</option>';
    } else if (typeValue === 'duct') {
        tonSelect.innerHTML = '<option value="6.8">6.8</option><option value="9.1">9.1</option><option value="10">10</option><option value="13.65">13.65</option><option value="18.2">18.2</option><option value="20">20</option>';
    } else {
        // Add default or other specific options based on type if necessary
        tonSelect.innerHTML = '<option value="">Select TON</option>';
    }
}

function deleteRow(button) {
    var row = button.parentNode.parentNode;
    var table = row.parentNode;
    table.removeChild(row);
    updateButtons();
}


function initializeTonOptions() {
    var rows = document.querySelectorAll('#customerTable tbody tr');
    rows.forEach(function(row, index) {
        var typeSelect = row.querySelector('select[name="Type[]"]');
        updateTonOptions(typeSelect);
    });
    updateButtons();
}

function updateButtons() {
    var rows = document.querySelectorAll('#customerTable tbody tr');
    rows.forEach(function(row, index) {
        var actionCell = row.querySelector('td:last-child');
        actionCell.innerHTML = '';
        
        if (index === 0) {
            // First row
            actionCell.innerHTML = '<button onclick="addRow(this)">+</button>';
        } else if (index === rows.length - 1) {
            // Last row
            actionCell.innerHTML = '<button onclick="addRow(this)">+</button> <button onclick="deleteRow(this)">-</button>';
        } else {
            // Middle rows
            actionCell.innerHTML = '<button onclick="deleteRow(this)">-</button>';
        }
    });
}