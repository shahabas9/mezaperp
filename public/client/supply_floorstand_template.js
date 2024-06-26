document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/floorstand_template?quotationId=${quotationId}`);
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
        const customerData = data[0];
        document.getElementById('customerName').textContent = customerData.project_name;
        document.getElementById('projectName').textContent = customerData.customer_name;
        document.getElementById('customerMob').textContent = customerData.mobile_no;
        document.getElementById('customerEmail').textContent = customerData.email;
        document.getElementById('fromName').textContent = 'Mezab Air Conditioning Co.';
        document.getElementById('fromMob').textContent = '+974 44929438';
        document.getElementById('refNo').textContent = customerData.quotation_id;
        document.getElementById('date').textContent = new Date().toLocaleDateString();

        const tableBody = document.getElementById('supplyTableBody');
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.type}</td>
                <td>${item.model}</td>
                <td>${item.ton}</td>
                <td>${item.quantity}</td>
                <td>${item.unit_price.toLocaleString()}</td>
                <td>${item.total_price.toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function displayTotalSum(data) {
    const totalSum = data.reduce((sum, row) => sum + parseFloat(row.total_price), 0);
    const totalSumContainer = document.getElementById('totalSumContainer');
    totalSumContainer.innerHTML = `<b>Total Amount: QAR ${totalSum.toLocaleString()}/-</b>`;
}
