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

    // Fetch and display projects
    async function fetchProjects() {
        const projects = await fetch('/projects').then(response => response.json());
        projectTableBody.innerHTML = ''; // Clear existing rows
        projects.forEach(project => {
            appendProjectRow(project);
        });
    }

    await fetchProjects();

    // Fetch customers and populate the customer_name select
    const customers = await fetch('/customers').then(response => response.json());
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.customer_id;
        option.textContent = customer.customer_name;
        customerNameSelect.appendChild(option);
    });

    // Toggle the form display
    addProjectBtn.addEventListener('click', () => {
        projectForm.reset(); // Reset the form
        projectForm.removeAttribute('data-project-id'); // Remove the project ID
        projectForm.classList.add('show');
    });

    // Close the form when the close button is clicked
    closeFormBtn.addEventListener('click', () => {
        projectForm.classList.remove('show');
        projectForm.reset(); // Reset the form
        projectForm.removeAttribute('data-project-id'); // Remove the project ID
    });

    // Handle project type and category changes
    projectTypeSelect.addEventListener('change', updateCategories);
    categorySelect.addEventListener('change', updateSubcategories);

    function updateCategories() {
        const projectType = projectTypeSelect.value;
        categorySelect.innerHTML = '';

        if (projectType === 'Fast Moving') {
            addOption(categorySelect, 'Supply', 'Supply');
            addOption(categorySelect, 'Supply & Installation', 'Supply & Installation');
        } else if (projectType === 'Non Fast Moving') {
            addOption(categorySelect, 'villa', 'Villa');
        }

        updateSubcategories(); // Update subcategories based on initial category
    }

    function updateSubcategories() {
        const category = categorySelect.value;
        subcategorySelect.innerHTML = '';

        if (category === 'Supply') {
            ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase().replace(/ /g, '_'), optionText);
            });
        } else if (category === 'Supply & Installation') {
            ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase().replace(/ /g, '_'), optionText);
            });
        } else if (category === 'villa') {
            ['Villa Option 1', 'Villa Option 2', 'Villa Option 3'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase().replace(/ /g, '_'), optionText);
            });
        }
    }

    function addOption(selectElement, value, text) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        selectElement.appendChild(option);
    }

    // Fetch and set quotation ID when customer is selected
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
    

    // Function to append a project row to the table
    function appendProjectRow(project) {
        const row = document.createElement('tr');
        row.id = `projectRow_${project.project_id}`;
        row.innerHTML = `
            <td>${project.customer_name}</td>
            <td>${project.quotation_id || ''}</td>
            <td>${project.project_name}</td>
            <td>${project.project_type}</td>
            <td>${project.category}</td>
            <td>${project.subcategory}</td>
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
        document.getElementById('quotation_id').value = project.quotation_id;

        const customerOption = [...customerNameSelect.options].find(option => option.value === project.customer_id);
        if (customerOption) {
            customerOption.selected = true;
        }

        projectForm.setAttribute('data-project-id', project.project_id); // Set project ID in data attribute
        projectForm.classList.add('show'); // Show the form
    }

    // Initialize the categories and subcategories
    updateCategories();
});
