document.addEventListener('DOMContentLoaded', async () => {
    const projectTableBody = document.getElementById('projectTableBody');
    const projectForm = document.getElementById('projectForm');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const customerNameSelect = document.getElementById('customer_name');
    const quotationIdInput = document.getElementById('quotation_id');
    const projectTypeSelect = document.getElementById('project_type');
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    const salePersonSelect = document.getElementById('sales_person');
    const contactSelect = document.getElementById('contact');
    const paginationContainer = document.getElementById('pagination');

    let projects = [];
    const recordsPerPage = 10;
    let currentPage = 1;

    async function fetchProjects(query = '') {
        let url = '/projects';
        if (query) {
            url += `?search=${encodeURIComponent(query)}`;
        }

        const response = await fetch(url);
        projects = await response.json();

        projects.sort((a, b) => parseInt(b.quotation_id.split(' ')[1]) - parseInt(a.quotation_id.split(' ')[1]));
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

    async function fetchCustomers() {
        const response = await fetch('/customers');
        const customers = await response.json();
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.customer_id;
            option.textContent = customer.customer_name;
            customerNameSelect.appendChild(option);
        });
    }

    async function deleteProject(projectId) {
        const response = await fetch(`/delete-project/${projectId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Project deleted successfully.');
            fetchProjects(); // Refresh the projects list
        } else {
            alert('An error occurred while deleting the project.');
        }
    }

    async function saveProject(projectData, method, url) {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        if (response.ok) {
            alert('Project details saved successfully.');
            projectForm.reset();
            projectForm.classList.remove('show');
            fetchProjects(); // Refresh the projects list
        } else {
            alert('An error occurred while saving project details.');
        }
    }

    addProjectBtn.addEventListener('click', () => {
        projectForm.reset();
        projectForm.removeAttribute('data-project-id');
        projectForm.classList.add('show');
    });

    closeFormBtn.addEventListener('click', () => {
        projectForm.classList.remove('show');
        projectForm.reset();
        projectForm.removeAttribute('data-project-id');
    });

     // Form submission for adding/editing projects
     projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(projectForm);
        const projectId = projectForm.getAttribute('data-project-id'); // Get project ID from data attribute
        const customerName = document.getElementById('customer_name').value; // Get customer name separately

        const projectData = {
            customer_id: formData.get('customer_name'),
            customer_name: customerName,
            project_name: formData.get('project_name'),
            project_type: formData.get('project_type'),
            category: formData.get('category'),
            subcategory: formData.get('subcategory'),
            sales_person: formData.get('sales_person'),
            contact: formData.get('contact'),
            quotation_id: formData.get('quotation_id')
        };

        let url;
        let method;
        if (projectId) {
            // If project ID exists, it means you're editing an existing project
            url = `/edit-project/${projectId}`;
            method = 'PUT';
        } else {
            // If project ID doesn't exist, it means you're adding a new project
            url = '/add-project';
            method = 'POST';
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            alert('Project details saved successfully.');
            projectForm.reset();
            projectForm.classList.remove('show');
            const updatedProject = await response.json();
            if (projectId) {
                updateProjectRow(updatedProject);
            } else {
                appendProjectRow(updatedProject);
            }
        } else {
            alert('An error occurred while saving project details.');
        }
    });

    // Form submission for deleting projects
    projectTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const projectId = e.target.dataset.projectId;
            const confirmDelete = confirm('Are you sure you want to delete this project?');
            if (confirmDelete) {
                const response = await fetch(`/delete-project/${projectId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Project deleted successfully.');
                    document.getElementById(`projectRow_${projectId}`).remove();
                } else {
                    alert('An error occurred while deleting the project.');
                }
            }
        } else if (e.target.classList.contains('edit-btn')) {
            // Edit button clicked, show the project form with pre-filled data
            const projectId = e.target.dataset.projectId;
            const project = await fetch(`/projects/${projectId}`).then(response => response.json());
            fillFormForEdit(project);
        }
    });

    // Handle search button click
    searchBtn.addEventListener('click', async () => {
        const quotationId = searchInput.value;
        if (quotationId !== '') {
            const projects = await fetch(`/projects?quotation_id=${quotationId}`).then(response => response.json());
            projectTableBody.innerHTML = ''; // Clear existing rows
            projects.forEach(project => {
                appendProjectRow(project);
            });
        } else {
            // If no quotationId is provided, fetch all projects
            await fetchProjects();
        }
    });

    customerNameSelect.addEventListener('change', async () => {
        const customerId = customerNameSelect.value;
        if (customerId) {
            const response = await fetch(`/customers/${customerId}`);
            const data = await response.json();
            quotationIdInput.value = data.quotation_id;
        } else {
            quotationIdInput.value = '';
        }
    });

    salePersonSelect.addEventListener('change', updateContact);

    function fillFormForEdit(project) {
        customerNameSelect.value = project.customer_id;
        document.getElementById('project_name').value = project.project_name;
        document.getElementById('project_type').value = project.project_type;
        updateCategories();
        document.getElementById('category').value = project.category;
        updateSubcategories();
        document.getElementById('subcategory').value = project.subcategory;
        document.getElementById('sales_person').value = project.sales_person;
        updateContact();
        document.getElementById('contact').value = project.contact;
        document.getElementById('quotation_id').value = project.quotation_id;

        projectForm.setAttribute('data-project-id', project.project_id);
        projectForm.classList.add('show');
        const customerOption = [...customerNameSelect.options].find(option => option.value === project.customer_id);
        if (customerOption) {
            customerOption.selected = true;
        }
    }

    function appendProjectRow(project) {
        const row = document.createElement('tr');
        row.id = `projectRow_${project.project_id}`;
        row.innerHTML = `
            <td>${project.customer_name}</td>
            <td>${project.quotation_id}</td>
            <td>${project.project_name}</td>
            <td>${project.project_type}</td>
            <td>${project.category}</td>
            <td>${project.subcategory}</td>
            <td>${project.salesperson_name}</td>
            <td>${project.salesperson_contact}</td>
            <td>
                <button class="edit-btn" data-project-id="${project.project_id}">Edit</button>
                <button class="delete-btn" data-project-id="${project.project_id}">Delete</button>
            </td>
        `;
        projectTableBody.appendChild(row);
    }

     // Function to update a project row in the table
     function updateProjectRow(project) {
        const row = document.getElementById(`projectRow_${project.project_id}`);
        row.innerHTML = `
            <td>${project.customer_name}</td>
            <td>${project.quotation_id || ''}</td>
            <td>${project.project_name}</td>
            <td>${project.project_type}</td>
            <td>${project.category}</td>
            <td>${project.subcategory}</td>
            <td>${project.salesperson_name}</td>
            <td>${project.salesperson_contact}</td>
            <td>
                <button class="edit-btn" data-project-id="${project.project_id}">Edit</button>
                <button class="delete-btn" data-project-id="${project.project_id}">Delete</button>
            </td>
        `;
    }

    // Function to fill the form for editing a project
    function fillFormForEdit(project) {
        document.getElementById('customer_name').value = project.customer_id;
        document.getElementById('project_name').value = project.project_name;
        document.getElementById('project_type').value = project.project_type;
        updateCategories();
        document.getElementById('category').value = project.category;
        updateSubcategories();
        document.getElementById('subcategory').value = project.subcategory;
        document.getElementById('sales_person').value = project.salesperson_name;
        updateContact();
        document.getElementById('contact').value = project.salesperson_contact;
        document.getElementById('quotation_id').value = project.quotation_id;

        const customerOption = [...customerNameSelect.options].find(option => option.value === project.customer_id);
        if (customerOption) {
            customerOption.selected = true;
        }

        projectForm.setAttribute('data-project-id', project.project_id); // Set project ID in data attribute
        projectForm.classList.add('show'); // Show the form
    }

    async function fetchCustomers() {
        const response = await fetch('/customers');
        const customers = await response.json();
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.customer_id;
            option.textContent = customer.customer_name;
            customerNameSelect.appendChild(option);
        });
    }

    // Handle project type and category changes
    projectTypeSelect.addEventListener('change', updateCategories);
    categorySelect.addEventListener('change', updateSubcategories);
    salePersonSelect.addEventListener('change', updateContact);

    function updateCategories() {
        const projectType = projectTypeSelect.value;
        categorySelect.innerHTML = '';

        if (projectType === 'Fast Moving') {
            addOption(categorySelect, 'Supply', 'Supply');
            addOption(categorySelect, 'Supply & Installation', 'Supply & Installation');
            addOption(categorySelect, 'other', 'other');
        } else if (projectType === 'Non Fast Moving') {
            addOption(categorySelect, 'villa', 'Villa');
            addOption(categorySelect, 'Other', 'Other');
        }

        updateSubcategories();
    }
    function updateSubcategories() {
        const category = categorySelect.value;
        subcategorySelect.innerHTML = '';

        if (category === 'Supply') {
            ['Duct', 'VRF', 'FloorStand', 'Package Units'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase().replace(/ /g, '_'), optionText);
            });
        } else if (category === 'Supply & Installation') {
            ['Cassette', 'Duct', 'Split', 'FloorStand', 'Split&FloorStand'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase().replace(/ /g, '_'), optionText);
            });
        } else if (category === 'villa') {
            ['Duct', 'Split', 'VRF', 'Duct&Split', 'Warehouse'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase().replace(/ /g, '_'), optionText);
            });
        } else if (category === 'Other') {
            ['AMC', 'Fan'].forEach(optionText => {
                addOption(subcategorySelect, optionText.replace(/ /g, '_'), optionText);
            });
        } else if (category === 'other') {
            ['BOQ', 'Spare Parts'].forEach(optionText => {
                addOption(subcategorySelect, optionText.replace(/ /g, '_'), optionText);
            });
        }
    }

    function updateContact() {
        const contact = salePersonSelect.value;
        contactSelect.innerHTML = '';

        if (contact === 'Ahmad Khaled') {
            addOption(contactSelect, '+974 55666980', '+974 55666980');
        } else if (contact === 'Abdulrahman') {
            addOption(contactSelect, '+974 55666950', '+974 55666950');
        } else if (contact === 'Saad Alkhalil') {
            addOption(contactSelect, '+974 66222700', '+974 66222700');
        }
    }

    function addOption(selectElement, value, text) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        selectElement.appendChild(option);
    }

    

     // Initialize the categories and subcategories
     updateCategories();
     updateContact();

    await fetchCustomers();
    await fetchProjects();
    $(document).ready(function() {
        $('.select2').select2({
            width: 'resolve'
        });
    });
});