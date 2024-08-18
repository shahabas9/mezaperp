document.addEventListener('DOMContentLoaded', async () => {
    const projectTableBody = document.getElementById('projectTableBody');
    const projectForm = document.getElementById('projectForm');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const employeeNameInput = document.getElementById('employee_name');
    const qatarIdInput = document.getElementById('qatar_id');
    const expiryinput = document.getElementById('expiry_date');
    const professionSelect = document.getElementById('profession');
    const renewalInput = document.getElementById('renewal_date');
    const contactInput = document.getElementById('contact');
    const paginationContainer = document.getElementById('pagination');

    let projects = [];
    const recordsPerPage = 10;
    let currentPage = 1;

    async function fetchQid(query = '') {
        let url = '/employees';
        if (query) {
            url += `?search=${encodeURIComponent(query)}`;
        }

        const response = await fetch(url);
        projects = await response.json();

        renderTable(currentPage);
        renderPagination();
    }

    function renderTable(page) {
        projectTableBody.innerHTML = ''; // Clear existing rows
    
        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const paginatedProjects = projects.slice(start, end);
    
        paginatedProjects.forEach(project => {
            appendProjectRow(project);
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';
    
        const totalPages = Math.ceil(projects.length / recordsPerPage);
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

    async function deleteEmployee(employeeId) {
        const response = await fetch(`/delete-employee/${employeeId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Employee details deleted successfully.');
            fetchQid(); // Refresh the projects list
        } else {
            alert('An error occurred while deleting the details.');
        }
    }

    async function saveProject(projectData, method, url) {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        if (response.ok) {
            alert('Employee details saved successfully.');
            projectForm.reset();
            projectForm.classList.remove('show');
            fetchQid(); // Refresh the projects list
        } else {
            alert('An error occurred while saving employee details.');
        }
    }

    addProjectBtn.addEventListener('click', () => {
        projectForm.reset();
        projectForm.removeAttribute('data-employee-id');
        projectForm.classList.add('show');
    });

    closeFormBtn.addEventListener('click', () => {
        projectForm.classList.remove('show');
        projectForm.reset();
        projectForm.removeAttribute('data-employee-id');
    });

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(projectForm);
        const employeeId = projectForm.getAttribute('data-employee-id');

        const projectData = {
            employee_name: formData.get('employee_name'),
            qatar_id: formData.get('qatar_id'),
            expiry_date: formData.get('expiry_date'),
            profession: formData.get('profession'),
            renewal_date: formData.get('renewal_date'),
            contact: formData.get('contact'),
        };

        let url;
        let method;
        if (employeeId) {
            url = `/edit-employee/${employeeId}`;
            method = 'PUT';
        } else {
            url = '/add-employee';
            method = 'POST';
        }

        saveProject(projectData, method, url);
    });

    projectTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const employeeId = e.target.dataset.employeeId;
            const confirmDelete = confirm('Are you sure you want to delete this employee detail?');
            if (confirmDelete) {
                deleteEmployee(employeeId);
            }
        } else if (e.target.classList.contains('edit-btn')) {
            const employeeId = e.target.dataset.employeeId;
            try {
                const employee = await fetch(`/employees/${employeeId}`).then(response => response.json());
                fillFormForEdit(employee);
            } catch (err) {
                console.error('Error fetching employee details:', err);
                alert('Failed to fetch employee details.');
            }
        }
    });
    

    searchBtn.addEventListener('click', async () => {
        const searchTerm = searchInput.value;
        await fetchQid(searchTerm);
    });

    function fillFormForEdit(employee) {
        employeeNameInput.value = employee.employee_name;
        qatarIdInput.value = employee.qatar_id;
        expiryinput.value = employee.expiry_date;
        professionSelect.value = employee.profession;
        renewalInput.value = employee.renewal_date;
        contactInput.value = employee.contact;

        projectForm.setAttribute('data-employee-id', employee.employee_id);
        projectForm.classList.add('show');
    }

    function appendProjectRow(employee) {
        const row = document.createElement('tr');
        row.id = `projectRow_${employee.employee_id}`;
    
        // Convert expiry date to a Date object
        const expiryDate = new Date(employee.expiry_date);
        const today = new Date();
        const twoWeeksFromNow = new Date(today);
        twoWeeksFromNow.setDate(today.getDate() + 14);
    
        // Check if expiry date is within the next two weeks
        if (expiryDate >= today && expiryDate <= twoWeeksFromNow) {
            row.style.backgroundColor = 'red';
            row.style.color = 'white'; // Optional: make text readable on red background
        }
    
        row.innerHTML = `
            <td>${employee.employee_name}</td>
            <td>${employee.qatar_id}</td>
            <td>${expiryDate.toISOString().split('T')[0]}</td>
            <td>${employee.profession}</td>
            <td>${employee.renewal_date.substring(0, 10)}</td>
            <td>
                <button class="edit-btn" data-employee-id="${employee.employee_id}">Edit</button>
                <button class="delete-btn" data-employee-id="${employee.employee_id}">Delete</button>
            </td>
        `;
        projectTableBody.appendChild(row);
    }
    

    await fetchQid();
});
