document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/cassettesi_template?quotationId=${quotationId}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const { data } = await response.json();
        if (!data || data.length === 0) {
            throw new Error('No data found');
        }

        populateTable(data);
        
    } catch (error) {
        console.error('Error fetching quotation data:', error);
    }
});

function populateTable(data) {
    if (data.length > 0) {
        console.log("Customer Data: ", data[0]);
        const customerData = data[0];
        document.getElementById('customerName').textContent = customerData.customer_name || "\u00A0";
        document.getElementById('projectName').textContent = customerData.project_name || "\u00A0";
        document.getElementById('customerMob').textContent = customerData.mobile_no || "\u00A0";
        document.getElementById('customerEmail').textContent = customerData.email || "\u00A0";
        document.getElementById('fromName').textContent = customerData.salesperson_name || "\u00A0";
        document.getElementById('fromMob').textContent = customerData.salesperson_contact || "\u00A0";
        document.getElementById('refNo').textContent = customerData.quotation_id || "\u00A0";
        document.getElementById('date').textContent = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        const tableBody = document.getElementById('supplyTableBody');
        const descriptions = {};

        let totalTonQuantity = 0;
        let totalQuantity = 0;
        let totalSum = 0;

        const selectiveItems = [
            'DUCTED SPLIT UNITS',
            'WALL MOUNTED SPLIT UNITS',
            'CASSETTE',
            'FLOOR STAND',
            'FAN',
            'PACKAGE UNIT',
            'VRF CEILING CONCEALED',
            'VRF OUTDOOR UNITS'
        ];

        data.forEach(item => {
            console.log("Item: ", item);
            const description = item.type.toUpperCase();
            if (!descriptions[description]) {
                descriptions[description] = { count: 0, rows: [] };
            }
            descriptions[description].count++;
            descriptions[description].rows.push(item);

            // Check if ton value is a valid number
            const tonValue = parseFloat(item.ton);
            const quantity = parseFloat(item.quantity);

            if (!isNaN(tonValue)) {
                const tonQuantity = tonValue * quantity;
                totalQuantity += tonQuantity;
                totalTonQuantity += quantity; // Only add valid quantity if ton is a valid number
            }

            totalSum += parseFloat(item.total_price);
        });

        Object.keys(descriptions).forEach(description => {
            const { count, rows } = descriptions[description];
            rows.forEach((item, index) => {
                const row = document.createElement('tr');
                if (index === 0) {
                    const descriptionCell = document.createElement('td');
                    descriptionCell.setAttribute('rowspan', count);
                    descriptionCell.className = 'merged-cell';

                    if (selectiveItems.includes(description)) {
                        descriptionCell.innerHTML = `<b><span style="color:black;">Supply Only of</span></b><br><b style="color:red;"> ${description}</b>`;
                    } else {
                        descriptionCell.innerHTML = `<b style="color:red; text-transform:uppercase;">${description}</b>`;
                    }
                    row.appendChild(descriptionCell);
                }

                // Create row with data
                row.innerHTML += `
                    <td>${item.ton}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit_price.toLocaleString()}</td>
                    <td>${item.total_price.toLocaleString()}</td>
                `;
                console.log("Row HTML: ", row.innerHTML);
                tableBody.appendChild(row);
            });
        });

        // Add the row with merged cells for totals
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td colspan="1"><b>Total</b></td>
            <td><b>${totalQuantity.toFixed(2)}</b></td>
            <td><b>${totalTonQuantity}</b></td>
            <td colspan="2"><b>QAR ${totalSum.toLocaleString()}</b></td>
        `;
        tableBody.appendChild(totalRow);
    }
}




function toggleText() {
    var selectBox = document.getElementById("togglePoint");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    var textDiv = document.getElementById("optionalText");
    
    if (selectedValue === "show") {
        textDiv.classList.remove("hide-print");
    } else {
        textDiv.classList.add("hide-print");
    }
}  
document.getElementById('printButton').addEventListener('click', function() {
    // Fetch the quotation ID and customer name
    const quotationId = document.getElementById('refNo').textContent.trim();
    const customerName = document.getElementById('projectName').textContent.trim();

    // Set the document title to the desired filename format
    document.title = `${quotationId}_${customerName}`;

    // Trigger the print dialog
    window.print();
});  

function goBack() {
    window.history.back();
}