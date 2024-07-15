document.addEventListener('DOMContentLoaded', async () => {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('quotationTableBody');
    const paginationContainer = document.getElementById('pagination');

    let currentPage = 1; // Initial current page
    const recordsPerPage = 10; // Number of records per page
    let quotations = []; // Array to store quotations
    let filteredQuotations = []; // Array to store filtered quotations
    let currentQuotations = []; // Array to store currently displayed quotations

    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        filteredQuotations = quotations.filter(quotation => quotation.quotation_id.toLowerCase().includes(searchTerm));
        currentPage = 1; // Reset to first page after search
        renderTable(currentPage);
        renderPagination();
    });
    async function fetchQuotations() {
        try {
            const response = await fetch('/api/quotations_sp');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            quotations = await response.json();
            filteredQuotations = [...quotations]; // Initialize filtered quotations with all quotations
            renderTable(currentPage);
            renderPagination();
        } catch (error) {
            console.error('Error fetching quotations:', error);
        }
    }
    function renderTable(page) {
        tableBody.innerHTML = ''; // Clear existing table rows

        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        currentQuotations = filteredQuotations.slice(start, end);

        currentQuotations.forEach(quotation => {
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

    function renderPagination() {
        paginationContainer.innerHTML = ''; // Clear existing pagination buttons

        const totalPages = Math.ceil(filteredQuotations.length / recordsPerPage);
        const maxPagesToShow = 5; // Maximum number of pages to show directly

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.classList.add('pagination-button');
            if (i === currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentPage = i;
                renderTable(currentPage);
                renderPagination();
            });
            paginationContainer.appendChild(button);
        }

        // Previous Button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.classList.add('pagination-button');
            prevButton.addEventListener('click', () => {
                currentPage--;
                renderTable(currentPage);
                renderPagination();
            });
            paginationContainer.insertBefore(prevButton, paginationContainer.firstChild);
        }

        // Next Button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.classList.add('pagination-button');
            nextButton.addEventListener('click', () => {
                currentPage++;
                renderTable(currentPage);
                renderPagination();
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    // Fetch quotations and initialize
    await fetchQuotations();
});

function generateQuotation(quotationId, subcategory) {
    console.log(`Quotation ID: ${quotationId}, Subcategory: ${subcategory}`); // Log the values
    
    let templatePage;
    
    switch (subcategory) {
        case 'Spare_Parts':
            templatePage = 'spareparts_template.html';
            break;
        default:
            console.error('Unknown subcategory');
            return; // Exit the function if the subcategory is unknown
    }

    console.log(`Redirecting to: ${templatePage}`); // Log the redirection
    window.location.href = `${templatePage}?quotationId=${quotationId}`;
}
  
  
  


