document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/fan_template?quotationId=${quotationId}`);
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
        document.getElementById('customerName').textContent = customerData.project_name;
        document.getElementById('projectName').textContent = customerData.customer_name;
        document.getElementById('customerMob').textContent = customerData.mobile_no;
        document.getElementById('customerEmail').textContent = customerData.email;
        document.getElementById('fromName').textContent = customerData.salesperson_name;
        document.getElementById('fromMob').textContent = customerData.salesperson_contact;
        document.getElementById('refNo').textContent = customerData.quotation_id;
        document.getElementById('date').textContent = new Date().toLocaleDateString();

        const tableBody = document.getElementById('supplyTableBody');
        let totalQuantity = 0;
        let totalPrice = 0;

        data.forEach(item => {
            const row = document.createElement('tr');
            let typeDescription = '';

            if (item.type === 'lineo-100QVO' || item.type === 'CA-100MD') {
                typeDescription = `‫‫مراوح‬ ‫شفط‬ ‫أسقف‬ ‫مخفية‬ ‫بمجاري‬ ‫هواء‬ <br>(${item.type}) <br>من ‫نوع <b style="color:red;">VORTICE</b>`;
            } else if (item.type === 'VD-15' || item.type === 'VD-10') {
                typeDescription = `‫‫مراوح‬ ‫شفط‬ ‫أسقف‬ ‫مخفية‬ ‫بمجاري‬ ‫هواء‬ <br>(${item.type}) <br>من ‫نوع <b style="color:red;">‫ميتسوبيش‫ي ‫‫إ‬‬ليكتريك‬</b>`;
            }

            row.innerHTML = `
                <td><strong>${item.total_price.toLocaleString()}</strong></td>
                <td><strong>${item.unit_price.toLocaleString()}</strong></td>
                <td><strong>${item.quantity}</strong></td>
                <td><strong>${item.location}</strong></td>
                <td><strong>${typeDescription}</strong></td>
            `;
            tableBody.appendChild(row);
            totalQuantity += parseFloat(item.quantity);
            totalPrice += parseFloat(item.total_price);
        });

         // Add the total row
         const totalRow = document.createElement('tr');
         totalRow.innerHTML = `
         <td colspan="2"><strong>QAR.${totalPrice.toLocaleString()}/-</strong></td>
         <td><strong>${totalQuantity}</strong></td>
         <td colspan="2"><strong>‫المجموع ‫الكلي‬ </strong></td>
         `;
        
        tableBody.appendChild(totalRow);
    }
}


