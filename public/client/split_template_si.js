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
        displayTotalSum(data);
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

        data.forEach(item => {
            console.log("Item: ", item);
            const description = item.type.toUpperCase();
            if (!descriptions[description]) {
                descriptions[description] = { count: 0, rows: [] };
            }
            descriptions[description].count++;
            descriptions[description].rows.push(item);
        });

        Object.keys(descriptions).forEach(description => {
            const { count, rows } = descriptions[description];
            rows.forEach((item, index) => {
                const row = document.createElement('tr');
                if (index === 0) {
                    const descriptionCell = document.createElement('td');
                    descriptionCell.setAttribute('rowspan', count);
                    descriptionCell.className = 'merged-cell';
                    descriptionCell.innerHTML = `<b><span style="color:black;">Supply and Installation of</span></b><br><b style="color:red;"> ${description}</b>`;
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

function checkTotalDiscount() {
    const amountInput = document.getElementById('amountInput');
    const amountInputValue = amountInput.value.trim();
    const totalSumContainer = document.getElementById('totalSumContainer');
    const totalAmountContainer = document.getElementById('totalAmountContainer');

    if (amountInputValue === '') {
        // Clear the discount input and hide the discount line
        amountInput.value = ''; // Clear the input
        totalAmountContainer.style.display = 'none'; // Hide the discount line
        totalSumContainer.innerHTML = `<b>Total Amount: QAR ${totalSum.toLocaleString()}/-</b>`; // Remove strike-through
    } else {
        totalAmountContainer.style.display = 'flex'; // Show the discount line
        totalSumContainer.innerHTML = `<b>Total Amount: <s>QAR ${totalSum.toLocaleString()}/-</s></b>`; // Add strike-through
    }
}

// Function to display the total sum
function displayTotalSum(data) {
    totalSum = data.reduce((sum, row) => sum + parseFloat(row.total_price), 0);
    const totalSumContainer = document.getElementById('totalSumContainer');
    
    // Display the total sum with the strike-through by default
    totalSumContainer.innerHTML = `<b>Total Amount: <s>QAR ${totalSum.toLocaleString()}/-</s></b>`;
    
    // Ensure the discount line is visible on page load
    document.getElementById('totalAmountContainer').style.display = 'flex';
    
    
}

// Add event listener to check for discount input changes
document.getElementById('amountInput').addEventListener('input', checkTotalDiscount);

// Ensure everything is initialized correctly on page load
window.onload = function() {
    checkTotalDiscount(); // Initialize the discount line visibility
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
    