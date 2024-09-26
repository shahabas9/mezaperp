document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/amc_template?quotationId=${quotationId}`);
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
        let totalQuantity = 0;

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.quantity}</strong></td>
                <td><strong>${item.type.toUpperCase()}</strong></td>
            `;
            tableBody.appendChild(row);
            totalQuantity += parseFloat(item.quantity);
        });

        // Add the total row
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td><strong> ${totalQuantity}</strong></td>
            <td><strong>‫المجموع</strong></td>
        `;
        tableBody.appendChild(totalRow);
    }
}

const amountInput = document.getElementById('amountInput');
const discountInput = document.getElementById('discountInput');

    amountInput.addEventListener('blur', formatAmount);
    amountInput.addEventListener('input', clearFormatting);

    discountInput.addEventListener('blur', formatAmount);
    discountInput.addEventListener('input', clearFormatting);

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