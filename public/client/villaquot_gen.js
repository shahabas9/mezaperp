document.addEventListener('DOMContentLoaded', async () => {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const searchName = document.getElementById('searchName');
    const searchMobile = document.getElementById('searchMobile');
    const tableBody = document.getElementById('quotationTableBody');
    const paginationContainer = document.getElementById('pagination');

    let currentPage = 1; // Initial current page
    const recordsPerPage = 10; // Number of records per page
    let quotations = []; // Array to store quotations
    let filteredQuotations = []; // Array to store filtered quotations
    let currentQuotations = []; // Array to store currently displayed quotations

    // Event listener for search button
    searchBtn.addEventListener('click', () => {
        performSearch();
    });

    // Add event listeners for Enter key on input fields
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    searchName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    searchMobile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Function to perform the search
    async function performSearch() {
        let quotationId = document.getElementById('searchInput').value.trim();
        const customerName = document.getElementById('searchName').value.trim();
        const mobileNumber = document.getElementById('searchMobile').value.trim();
    
        let query = '';
        let params = [];
    
        if (quotationId !== '') {
            // Normalize the quotation ID
            quotationId = quotationId.replace(/\s+/g, '').toUpperCase(); // Remove spaces and convert to uppercase
    
            // Handle cases like "1", "01", "QT001", "qt001", etc.
            if (quotationId.startsWith('QT')) {
                // If it starts with "QT", ensure it has the right number of digits
                quotationId = 'QT ' + quotationId.substring(2).padStart(3, '0');
            } else {
                // If it doesn't start with "QT", assume it's a number and format it
                quotationId = 'QT ' + quotationId.padStart(3, '0');
            }
    
            query = `/api/villa_data?quotationId=${encodeURIComponent(quotationId)}`;
        } else if (customerName !== '') {
            query = `/api/villa_data?customerName=${encodeURIComponent(customerName)}`;
        } else if (mobileNumber !== '') {
            query = `/api/villa_data?mobileNumber=${encodeURIComponent(mobileNumber)}`;
        } else {
            // If no input is provided, fetch all records
            await fetchAllRecords();
            return;
        }
    
        try {
            const response = await fetch(query);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            data.sort((a, b) => parseInt(b.quotation_id.split(' ')[1]) - parseInt(a.quotation_id.split(' ')[1]));
            quotations = data;
            filteredQuotations = [...quotations];
            currentPage = 1; // Reset to first page after fetch
            renderTable(currentPage);
            renderPagination();
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    }
    

    // Function to fetch all records
    async function fetchAllRecords() {
        try {
            const response = await fetch('/api/villa_data');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            data.sort((a, b) => parseInt(b.quotation_id.split(' ')[1]) - parseInt(a.quotation_id.split(' ')[1]));
            quotations = data;
            filteredQuotations = [...quotations];
            currentPage = 1; // Reset to first page after fetch
            renderTable(currentPage);
            renderPagination();
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    }

    // Function to render the table
    function renderTable(page) {
        tableBody.innerHTML = ''; // Clear existing table rows

        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        currentQuotations = filteredQuotations.slice(start, end);

        currentQuotations.forEach(quotation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${quotation.quotation_id}</td>
                <td>${quotation.customer_name}</td>
                <td>${quotation.customer_mobile_number}</td>
                <td>${quotation.subcategory}</td>
                <td><button onclick="generateQuotation('${quotation.quotation_id}', '${quotation.subcategory}')">Generate Quotation</button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to render pagination
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

    // Initial fetch and render
    await fetchAllRecords();
});

function generateQuotation(quotationId, subcategory) {
    console.log(`Quotation ID: ${quotationId}, Subcategory: ${subcategory}`); // Log the values
    
    let templatePage;
    
    switch (subcategory) {
        case 'duct':
            templatePage = 'duct_villa.html';
            break;
        case 'split':
            templatePage = 'split_villa.html';
            break;
        case 'duct&split':
            templatePage = 'duct_split_villa.html';
            break;
        case 'vrf':
            templatePage = 'vrf_template_villa.html';
            break;
        default:
            console.error('Unknown subcategory');
            return; // Exit the function if the subcategory is unknown
    }

    console.log(`Redirecting to: ${templatePage}`); // Log the redirection
    window.location.href = `${templatePage}?quotationId=${quotationId}`;
}
function goBack() {
    window.history.back();
}