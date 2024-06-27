document.addEventListener('DOMContentLoaded', async () => {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('quotationTableBody');

    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const quotationId = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            if (quotationId.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    async function fetchQuotations() {
        try {
            const response = await fetch('/api/quotations_supply');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const quotations = await response.json();
            populateTable(quotations);
        } catch (error) {
            console.error('Error fetching quotations:', error);
        }
    }

    function populateTable(quotations) {
        tableBody.innerHTML = '';
        quotations.forEach(quotation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${quotation.customer_name}</td>
                <td>${quotation.quotation_id}</td>
                <td>${quotation.subcategory}</td>
                <td><button onclick="generateQuotation('${quotation.quotation_id}', '${quotation.subcategory}')">Generate Quotation</button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    fetchQuotations();
});

function generateQuotation(quotationId, subcategory) {
    console.log(`Quotation ID: ${quotationId}, Subcategory: ${subcategory}`); // Log the values
    
    let templatePage;
    
    switch (subcategory) {
        case 'floorstand':
            templatePage = 'floorstand_template.html';
            break;
        case 'duct':
            templatePage = 'duct_supply_template.html';
            break;
        case 'split':
            templatePage = 'duct_supply_template.html';
            break;
        case 'package_units':
            templatePage = 'packageunit_template.html';
            break;
        case 'vrf':
            templatePage = 'vrf_template.html';
            break;
        default:
            console.error('Unknown subcategory');
            return; // Exit the function if the subcategory is unknown
    }

    console.log(`Redirecting to: ${templatePage}`); // Log the redirection
    window.location.href = `${templatePage}?quotationId=${quotationId}`;
}
  
  
  


