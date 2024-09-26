document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/packageunit_template?quotationId=${quotationId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const { data } = await response.json();
        populateTable(data);
        displayTotalSum(data);
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

        data.forEach(item => {
            console.log("Item: ", item);
            const description = item.type.toUpperCase();
            if (!descriptions[description]) {
                descriptions[description] = { count: 0, rows: [] };
            }
            descriptions[description].count++;
            descriptions[description].rows.push(item);

            const tonQuantity = parseFloat(item.ton) * item.quantity;
            totalQuantity += tonQuantity;
            totalSum += parseFloat(item.total_price);
            totalTonQuantity += parseFloat(item.quantity);
        });

        Object.keys(descriptions).forEach(description => {
            const { count, rows } = descriptions[description];
            rows.forEach((item, index) => {
                const row = document.createElement('tr');
                if (index === 0) {
                    const descriptionCell = document.createElement('td');
                    descriptionCell.setAttribute('rowspan', count);
                    descriptionCell.className = 'merged-cell';
                    descriptionCell.innerHTML = `<b><span style="color:black;">Supply Only of</span></b><br><b style="color:red;"> ${description}</b>`;
                    row.appendChild(descriptionCell);
                }
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
            <td><b>${totalTonQuantity.toFixed(2)}</b></td>
            
            <td colspan="2"><b>QAR ${totalSum.toLocaleString()}</b></td>
        `;
        tableBody.appendChild(totalRow);

        
    }
}



const amountInput = document.getElementById('amountInput');

    amountInput.addEventListener('blur', formatAmount);
    amountInput.addEventListener('input', clearFormatting);

    function clearFormatting() {
        this.value = this.value.replace(/,/g, '');
    }

    function formatAmount() {
        const value = parseFloat(this.value.replace(/,/g, ''));
        if (!isNaN(value)) {
            this.value = value.toLocaleString();
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