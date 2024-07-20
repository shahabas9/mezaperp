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
        const quotationId = searchInput.value.trim();
        if (quotationId) {
            fetchRecordsByQuotationId(quotationId);
        } else {
            fetchAllRecords();
        }
    });

    async function fetchAllRecords() {
        try {
            const response = await fetch('/api/sp_data');
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

    function fetchRecordsByQuotationId(quotationId) {
        console.log(`Fetching data for Quotation ID: ${quotationId}`);
        fetch(`/api/sp_data/${quotationId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Data received:', data);
                quotations = data; // Update quotations with filtered data
                filteredQuotations = [...quotations]; // Update filteredQuotations
                currentPage = 1; // Reset to first page after fetch
                renderTable(currentPage);
                renderPagination();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    function renderTable(page) {
        tableBody.innerHTML = ''; // Clear existing table rows

        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        currentQuotations = filteredQuotations.slice(start, end);

        currentQuotations.forEach(quotation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${quotation.quotation_id}</td>
                <td>${quotation.type}</td>
                <td>${quotation.model}</td>
                <td>${quotation.quantity}</td>
                <td>${quotation.quantity}</td>
                <td>${quotation.total_price}</td>
                <td><button onclick="editRecord('${quotation.quotation_id}')">Edit</button></td>
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

    // Initial fetch and render
    await fetchAllRecords();
});

function editRecord(quotationId) {
    window.location.href = `/spare_parts_edit.html?quotationId=${quotationId}`;
}
