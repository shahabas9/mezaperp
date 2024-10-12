document.addEventListener('DOMContentLoaded', async () => {
    const projectTableBody = document.getElementById('projectTableBody');
    const projectForm = document.getElementById('projectForm');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const customerNameSelect = document.getElementById('customer_name');
    const quotationIdSelect = document.getElementById('quotation_id');
    const agreementIdInput = document.getElementById('agreement_id');
    const projectTypeSelect = document.getElementById('project_type');
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');

    const paginationContainer = document.getElementById('pagination');

    let projects = [];
    const recordsPerPage = 10;
    let currentPage = 1;

    async function fetchProjects(query = '') {
        let url = '/agreement';
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

    $(document).ready(function() {
        // Initialize Select2
        $('.select2').select2();
        
        // Function to fetch customers and populate dropdown
        async function fetchCustomers() {
            const response = await fetch('/customers_agr');
            const customers = await response.json();
            const customerSelect = $('#customer_name');
            customerSelect.empty(); // Clear previous options
            
            customers.forEach(customer => {
                const option = new Option(customer.customer_name, customer.customer_id, false, false);
                customerSelect.append(option);
            });
            
            customerSelect.trigger('change'); // Trigger change event to update Select2
        }

        // Function to fetch quotations based on customer ID
        async function fetchQuotations(customerId) {
            console.log("Fetching quotations for customerId:", customerId); // Debug statement
            if (!customerId) {
                console.error("Invalid customerId:", customerId);
                return;
            }
        
            try {
                const response = await fetch(`/quotations_agr?customer_id=${customerId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const quotations = await response.json();
                const quotationSelect = $('#quotation_id');
                quotationSelect.empty(); // Clear previous options
        
                quotations.forEach(quotation => {
                    const option = new Option(quotation.quotation_id, quotation.quotation_id, false, false);
                    quotationSelect.append(option);
                });
        
                quotationSelect.trigger('change'); // Trigger change event to update Select2
            } catch (error) {
                console.error("Error fetching quotations:", error);
            }
        }

        function fillFormForEdit(project) {
            // Set the read-only agreement ID
            console.log("Project data:", project); // Debug the entire project object

            if (!project.project_id && !project.sl_no) {
                console.error("Project ID or SL number is missing."); // Error message if IDs are missing
                return;
            }

            // Assuming you want to use project_id
            const projectId = project.project_id ? project.project_id : project.sl_no;
            console.log("Setting data-project-id with projectId:", projectId); // 
            document.getElementById('agreement_id').value = project.agreement_id;
            document.getElementById('agreement_id').readOnly = true;
            
            // Set other fields
            document.getElementById('customer_name').value = project.customer_id;

            // Fetch and set quotations
            fetchQuotations(project.customer_id).then(() => {
                document.getElementById('quotation_id').value = project.quotation_id;
            });

            document.getElementById('project_location').value = project.project_location;
            document.getElementById('project_type').value = project.project_type;
            document.getElementById('category').value = project.category;
            document.getElementById('subcategory').value = project.subcategory;
            document.getElementById('id_number').value = project.id_number;

            // Show the form
            projectForm.classList.add('show');

            // Set the project ID as a data attribute
            projectForm.setAttribute('data-project-id', project.sl_no);
            console.log("Setting data-project-id:", project.sl_no); // Debug statement
        }

        projectTableBody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const projectId = e.target.dataset.projectId;
                const confirmDelete = confirm('Are you sure you want to delete this project?');
                if (confirmDelete) {
                    await deleteProject(projectId);
                }
            } else if (e.target.classList.contains('edit-btn')) {
                // Edit button clicked, show the project form with pre-filled data
                const projectId = e.target.dataset.projectId;
                const project = await fetch(`/projects_agr/${projectId}`).then(response => response.json());
                fillFormForEdit(project);
            }
        });

        // Existing search button event listener
    searchBtn.addEventListener('click', async () => {
        await performSearch();
    });

    // New event listener for the input fields
    const inputFields = [document.getElementById('searchInput'), document.getElementById('searchName'), document.getElementById('searchMobile')];

    inputFields.forEach(inputField => {
        inputField.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                await performSearch();
            }
        });
    });
   });

   async function performSearch() {
    let agreementId = document.getElementById('searchInput').value.trim();
    const customerName = document.getElementById('searchName').value.trim();
    const mobileNumber = document.getElementById('searchMobile').value.trim();

    let query = '';
    let params = [];

    if (agreementId !== '') {
        // Normalize the agreement ID (similar to quotation normalization)
        agreementId = agreementId.replace(/\s+/g, '').toUpperCase(); // Remove spaces and convert to uppercase

        // Handle cases like "1", "01", "AGR001", "agr001", etc.
        if (agreementId.startsWith('AGR')) {
            // Ensure "AGR" has the correct number of digits
            agreementId = 'AGR/' + agreementId.substring(3).padStart(3, '0');
        } else {
            // Assume it's a number and format it
            agreementId = 'AGR/' + agreementId.padStart(3, '0');
        }

        query = `/agreement?agreement_id=${encodeURIComponent(agreementId)}`;
    } else if (customerName !== '') {
        query = `/agreement?customer_name=${encodeURIComponent(customerName)}`;
    } else if (mobileNumber !== '') {
        query = `/agreement?mobile_no=${encodeURIComponent(mobileNumber)}`;
    } else {
        // If no input is provided, fetch all agreements
        await fetchProjects();
        return;
    }

    const projects = await fetch(query).then(response => response.json());
    projectTableBody.innerHTML = ''; // Clear existing rows
    projects.forEach(project => {
        appendProjectRow(project);
    });
}

    


    async function deleteProject(projectId) {
        const response = await fetch(`/delete-project_agr/${projectId}`, { method: 'DELETE' });
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
    
        const projectData = {
            customer_id: formData.get('customer_name'),
            customer_name: document.getElementById('customer_name').selectedOptions[0].text,
            project_location: formData.get('project_location'),
            project_type: formData.get('project_type'),
            category: formData.get('category'),
            subcategory: formData.get('subcategory'),
            quotation_id: formData.get('quotation_id'),
            id_number: formData.get('id_number')
        };
    
        let url;
        let method;
        if (projectId) {
            // Edit project
            url = `/edit-project_agr/${projectId}`;
            method = 'PUT';
            projectData.agreement_id = document.getElementById('agreement_id').value; // Include agreement ID in edit request
        } else {
            // Add new project
            url = '/add-project_agr';
            method = 'POST';
        }
    
        await saveProject(projectData, method, url);
    });
    
    

    // Form submission for deleting projects
    

   // Event listener for search button
    searchBtn.addEventListener('click', async () => {
        const agreementId = searchInput.value;
        if (agreementId !== '') {
            const projects = await fetch(`/agreement?agreement_id=${agreementId}`).then(response => response.json());
            projectTableBody.innerHTML = ''; // Clear existing rows
            projects.forEach(project => {
                appendProjectRow(project);
            });
        } else {
            // If no quotationId is provided, fetch all projects
            await fetchProjects();
        }
    });

    

    function appendProjectRow(agreement) {
        const row = document.createElement('tr');
        row.id = `projectRow_${agreement.project_id}`;
        row.innerHTML = `
            <td>${agreement.customer_name}</td>
            <td>${agreement.mobile_no}</td>
            <td>${agreement.quotation_id}</td>
            <td>${agreement.agreement_id}</td>
            <td>${agreement.id_number}</td>
            <td>${agreement.project_location}</td>
            <td>${agreement.project_type}</td>
            <td>${agreement.category}</td>
            <td>${agreement.subcategory}</td>
            <td>
                <button class="edit-btn" data-project-id="${agreement.project_id}">Edit</button>
                <button class="delete-btn" data-project-id="${agreement.project_id}">Delete</button>
            </td>
        `;
        projectTableBody.appendChild(row);
    }

    

    // Handle project type and category changes
    projectTypeSelect.addEventListener('change', updateCategories);
    categorySelect.addEventListener('change', updateSubcategories);
    

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

    function addOption(selectElement, value, text) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        selectElement.appendChild(option);
    }

     // Initialize the categories and subcategories
     updateCategories();

    await fetchProjects(); // Fetch initial projects
   
});


function goBack() {
    window.history.back();
}