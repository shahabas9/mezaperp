document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/splitsi_template?quotationId=${quotationId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const { data } = await response.json();
        populateTable(data);
        
    } catch (error) {
        console.error('Error fetching quotation data:', error);
    }
});

function populateTable(data) {
    if (data.length > 0) {
        console.log("Customer Data: ", data[0]);
        const customerData = data[0];
        document.getElementById('customerName').textContent = customerData.project_name;
        document.getElementById('projectName').textContent = customerData.customer_name;
        document.getElementById('customerMob').textContent = customerData.mobile_no;
        document.getElementById('customerEmail').textContent = customerData.email;
        document.getElementById('fromName').textContent = customerData.salesperson_name;
        document.getElementById('fromMob').textContent = customerData.salesperson_contact;
        document.getElementById('refNo').textContent = customerData.quotation_id;
        document.getElementById('date').textContent = new Date().toLocaleDateString();

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
        totalRow.id = 'totalRow'; // Assign an ID to this row for easy manipulation
        totalRow.innerHTML = `
            <td colspan="1"><b>Total</b></td>
            <td><b>${totalQuantity.toFixed(2)}</b></td>
            <td><b>${totalTonQuantity.toFixed(2)}</b></td>
            <td colspan="2"><b id="totalAmount">QAR ${totalSum.toLocaleString()}</b></td>
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
let totalSum = 0; // Define totalSum globally



// Function to display the total sum
function checkTotalDiscount() {
    const amountInput = document.getElementById('amountInput');
    const amountInputValue = amountInput.value.trim();
    const totalAmountContainer = document.getElementById('totalAmountContainer');
    const totalAmountElement = document.getElementById('totalAmount');

    if (!totalAmountElement) {
        console.error('totalAmount element not found');
        return;
    }

    if (amountInputValue === '') {
        // Clear the input and show the total without a strike-through
        totalAmountContainer.style.display = 'none'; // Hide the discount line only when input is cleared
        totalAmountElement.style.textDecoration = 'none';
    } else {
        // Show the discount line and apply the strike-through
        totalAmountContainer.style.display = 'flex'; // Show the discount line
        totalAmountElement.style.textDecoration = 'line-through';
    }
}

// Ensure this runs after DOM is fully loaded
window.onload = function() {
    document.getElementById('amountInput').addEventListener('input', checkTotalDiscount);
};




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
    