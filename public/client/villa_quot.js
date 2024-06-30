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

    cell1.innerHTML = '<select name="Location[]"><option value="Ground Floor">Ground Floor</option><option value="Basement">Basement</option><option value="Mezzanine">Mezzanine</option><option value="Penthouse">Penthouse</option><option value="Out Majlis">Out Majlis</option><option value="Out Kitchen">Out Kitchen</option><option value="Outblock">Outblock</option></select>';
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
        tonSelect.innerHTML = '<option value="1.5">1.5</option><option value="2.5">2.5</option><option value="2.75">2.75</option><option value="3">3</option><option value="4.26">4.26</option><option value="5">5</option><option value="6.66">6.66</option><option value="8.33">8.33</option>';
    } else if (typeValue === 'wall mounted') {
        tonSelect.innerHTML = '<option value="1">1</option><option value="1.5">1.5</option><option value="2">2</option><option value="2.5">2.5</option><option value="3">3</option>';
    } else if (typeValue === 'cassette') {
        tonSelect.innerHTML = '<option value="1.5">1.5</option><option value="2.5">2.5</option><option value="2.75">2.75</option><option value="3">3</option><option value="4">4</option><option value="4.25">4.25</option>';
    } else if (typeValue === 'floor stand') {
        tonSelect.innerHTML = '<option value="2.3">2.3</option><option value="3.25">3.25</option><option value="4">4</option><option value="4.35">4.35</option>';
    } else if (typeValue === 'package units') {
        tonSelect.innerHTML = '<option value="6.8">6.8</option><option value="9.1">9.1</option><option value="10">10</option><option value="13.65">13.65</option><option value="18.2">18.2</option><option value="20">20</option><option value="28.5">28.5</option>';
    }else {
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