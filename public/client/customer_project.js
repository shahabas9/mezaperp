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

        projects.sort((a, b) => {
            const [idA, revA] = a.quotation_id.split('_');
            const [idB, revB] = b.quotation_id.split('_');
        
            // Sort by the base Quotation ID in descending order
            const numA = parseInt(idA.split(' ')[1]);
            const numB = parseInt(idB.split(' ')[1]);
            
            if (numA !== numB) {
                return numB - numA; // Descending order by base Quotation ID
            }
        
            // If base Quotation IDs are equal, sort revisions in descending order
            const revNumA = revA ? parseInt(revA.replace('RV', '')) : 0;
            const revNumB = revB ? parseInt(revB.replace('RV', '')) : 0;
            
            return revNumB - revNumA; // Descending order by revision number
        });
        
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
    
        // Sort customers by customer_id in descending order
        customers.sort((a, b) => b.customer_id - a.customer_id);
    
        // Assuming customerNameSelect is the <select> element
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
    
        // Show confirmation dialog
        const confirmation = confirm("Are you sure you want to submit the project details?");
        
        // If the user clicks "No" (Cancel), close the form and do nothing
        if (!confirmation) {
            projectForm.classList.remove('show'); // Close the form (assuming 'show' class is used to display it)
            return; // Stop further execution
        }
    
        const quotationId = document.getElementById('quotation_id').value;
        console.log('Quotation ID being sent:', quotationId);
        const formData = new FormData(projectForm);
        const projectId = projectForm.getAttribute('data-project-id'); // Get project ID from data attribute
        const customerName = document.getElementById('customer_name').value; // Get customer name separately
    
        const projectData = {
            customer_id: formData.get('customer_name'),
            customer_name: customerName,
            project_name: formData.get('project_name'),
            project_area: formData.get('project_area'),
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
            alert('Project details data saved successfully.');
            projectForm.reset();
            window.location.reload();
            projectForm.classList.remove('show');
            const updatedProject = await response.json();
            if (projectId) {
                updateProjectRow(updatedProject);
            } else {
                appendProjectRow(updatedProject);
            }
        } else {
            alert('An error occurred while saving project details data.');
        }
    });
    

    // Form submission for deleting projects
    projectTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const projectId = e.target.dataset.projectId;
            const confirmDelete = confirm('Are you sure you want to delete this project details data?');
            if (confirmDelete) {
                const response = await fetch(`/delete-project/${projectId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Project deleted successfully.');
                    document.getElementById(`projectRow_${projectId}`).remove();
                } else {
                    alert('An error occurred while deleting the project details data.');
                }
            }
        } else if (e.target.classList.contains('edit-btn')) {
            // Edit button clicked, show the project form with pre-filled data
            const projectId = e.target.dataset.projectId;
            const project = await fetch(`/projects/${projectId}`).then(response => response.json());
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

            query = `/projects?quotation_id=${encodeURIComponent(quotationId)}`;
        } else if (customerName !== '') {
            query = `/projects?customer_name=${encodeURIComponent(customerName)}`;
        } else if (mobileNumber !== '') {
            query = `/projects?mobile_number=${encodeURIComponent(mobileNumber)}`;
        } else {
            // If no input is provided, fetch all projects
            await fetchProjects();
            return;
        }

        const projects = await fetch(query).then(response => response.json());
        projectTableBody.innerHTML = ''; // Clear existing rows
        projects.forEach(project => {
            appendProjectRow(project);
        });
    }

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

    

    function fillFormForEdit(project) {
        customerNameSelect.value = project.customer_id;
        document.getElementById('project_name').value = project.project_name;
        document.getElementById('project_area').value = project.project_area;
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
        const formatText = (text) => {
            return text.replace(/_/g, ' ') // Replace underscores with spaces
                       .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize the first letter of each word
        };

        row.innerHTML = `
            <td>${formatText(project.customer_name)}</td>
            <td>${project.mobile_no}</td>
            <td>${project.quotation_id}</td>
            <td>${project.project_name}</td>
            
            <td>${project.category}</td>
            <td>${formatText(project.subcategory)}</td>
            <td>${project.salesperson_name}</td>
            
            <td>
                <button class="edit-btn" data-project-id="${project.project_id}">Edit</button>
                <button class="modify-btn" data-project-id="${project.project_id}">Modify</button>
                <button class="generate-btn" data-project-id="${project.project_id}">Generate</button>
                <button class="delete-btn" data-project-id="${project.project_id}">Delete</button>
                
            </td>
        `;
        projectTableBody.appendChild(row);
    }

     // Function to update a project row in the table
     function updateProjectRow(project) {
        const row = document.getElementById(`projectRow_${project.project_id}`);
    
        const formatText = (text) => {
            return text.replace(/_/g, ' ') // Replace underscores with spaces
                       .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize the first letter of each word
        };
    
        row.innerHTML = `
            <td>${formatText(project.customer_name)}</td>
            <td>${project.quotation_id || ''}</td>
            <td>${project.project_name}</td>
            
            <td>${project.category}</td>
            <td>${formatText(project.subcategory)}</td>
            <td>${project.salesperson_name}</td>
            
            <td>
                <button class="edit-btn" data-project-id="${project.project_id}">Edit</button>
                <button class="modify-btn" data-project-id="${project.project_id}">Modify</button>
                <button class="generate-btn" data-project-id="${project.project_id}">Generate</button>
                <button class="delete-btn" data-project-id="${project.project_id}">Delete</button>
                
            </td>
        `;
    }
    

    // Function to fill the form for editing a project
    function fillFormForEdit(project) {
        document.getElementById('customer_name').value = project.customer_id;
        document.getElementById('project_name').value = project.project_name;
        document.getElementById('project_area').value = project.project_area;
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
    
        // Sort customers by customer_id in descending order
        customers.sort((a, b) => b.customer_id - a.customer_id);
    
        // Assuming customerNameSelect is the <select> element
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
    
        const formatOptionText = (text) => {
            return text.replace(/_/g, ' ') // Replace underscores with spaces
                       .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize the first letter of each word
        };
    
        if (category === 'Supply') {
            ['Ducted Split', 'VRF', 'FloorStand', 'Package Units','Air Curtain'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase(), formatOptionText(optionText));
            });
        } else if (category === 'Supply & Installation') {
            ['Cassette', 'Ducted Split', 'Split', 'FloorStand', 'Split&FloorStand'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase(), formatOptionText(optionText));
            });
        } else if (category === 'villa') {
            ['Split','Ducted Split',  'VRF', 'Duct&Split', 'Warehouse'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase(), formatOptionText(optionText));
            });
        } else if (category === 'Other') {
            ['AMC', 'Fan'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase().replace(/ /g, ''), formatOptionText(optionText));
            });
        } else if (category === 'other') {
            ['BOQ', 'Spare Parts','Custom'].forEach(optionText => {
                addOption(subcategorySelect, optionText.toLowerCase().replace(/ /g, ''), formatOptionText(optionText));
            });
        }
    }
    
    fetch('/api/sales')
        .then(response => response.json())
        .then(data => {
            // Populate the sales person select
            data.forEach(sale => {
                const option = document.createElement('option');
                option.value = sale.person_name;
                option.textContent = sale.person_name;
                salePersonSelect.appendChild(option);
            });

            // Update contact when a sales person is selected
            salePersonSelect.addEventListener('change', function() {
                const selectedPerson = salePersonSelect.value;
                contactSelect.innerHTML = ''; // Clear previous contacts

                const selectedSale = data.find(sale => sale.person_name === selectedPerson);
                if (selectedSale) {
                    const option = document.createElement('option');
                    option.value = selectedSale.contact;
                    option.textContent = selectedSale.contact;
                    contactSelect.appendChild(option);
                }
            });
        })
        .catch(error => console.error('Error fetching sales data:', error));


    function addOption(selectElement, value, text) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        selectElement.appendChild(option);
    }

    

     // Initialize the categories and subcategories
     updateCategories();
     

    await fetchCustomers();
    await fetchProjects();
    $(document).ready(function() {
        $('.select2').select2({
            width: 'resolve'
        });
    });
});

function goBack() {
    window.history.back();
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modify-btn')) {
        const projectId = event.target.getAttribute('data-project-id');
        const projectRow = document.getElementById(`projectRow_${projectId}`);
        const category = projectRow.querySelector('td:nth-child(5)').textContent.trim();
        const subCategory = projectRow.querySelector('td:nth-child(6)').textContent.trim();
        const quotationId = projectRow.querySelector('td:nth-child(3)').textContent.trim();

        let redirectUrl = '';

        if (category === 'Supply') {
            redirectUrl = `supply_edit.html?quotationId=${quotationId}`;
        } else if (category === 'villa') {
            redirectUrl = `villa_edit.html?quotationId=${quotationId}`;
        } else if (category === 'Supply & Installation') {
            redirectUrl = `supply_inst_edit.html?quotationId=${quotationId}`;
        } else if (subCategory === 'AMC') {
            redirectUrl = `amc_edit.html?quotationId=${quotationId}`;
        } else if (subCategory === 'Fan') {
            redirectUrl = `fan_edit.html?quotationId=${quotationId}`;
        } else if (subCategory === 'BOQ') {
            redirectUrl = `boq_edit.html?quotationId=${quotationId}`;
        } else if (subCategory === 'Custom') {
            redirectUrl = `https://docs.google.com/document/d/1zhvwocfwzDLtuSG77JwWZeLTOKNelM1elfdbk6gFqSA/edit`;
        } else if (subCategory === 'Spare Parts') {
            redirectUrl = `spare_parts_edit.html?quotationId=${quotationId}`;
        } else {
            alert('Category not recognized. No action taken.');
        }

        // Open the URL in a new tab if a valid URL was generated
        if (redirectUrl) {
            window.open(redirectUrl, '_blank');  // Open in a new tab
        }
    }
});


document.addEventListener('click', function(event) {
    if (event.target.classList.contains('generate-btn')) {
        const projectId = event.target.getAttribute('data-project-id');
        const projectRow = document.getElementById(`projectRow_${projectId}`);
        const category = projectRow.querySelector('td:nth-child(5)').textContent.trim();
        const subcategory = projectRow.querySelector('td:nth-child(6)').textContent.trim();
        const quotationId = projectRow.querySelector('td:nth-child(3)').textContent.trim();

        let redirectUrl = '';

        // Check for Supply category
        if (category === 'Supply') {
            if (subcategory === 'Ducted Split') {
                redirectUrl = `duct_supply_template.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Split') {
                redirectUrl = `duct_supply_template.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Floorstand') {
                redirectUrl = `floorstand_template.html?quotationId=${quotationId}`;
            }else if (subcategory === 'Air Curtain') {
                redirectUrl = `air_curtain.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Package Units') {
                redirectUrl = `packageunit_template.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Vrf') {
                redirectUrl = `vrf_template.html?quotationId=${quotationId}`;
            }
        }
        // Check for Villa category
        else if (category === 'villa') {
            if (subcategory === 'Ducted Split') {
                redirectUrl = `duct_villa.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Split') {
                redirectUrl = `split_villa.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Duct&Split') {
                redirectUrl = `duct_split_villa.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Package Units') {
                redirectUrl = `packageunit_template.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Vrf') {
                redirectUrl = `vrf_template_villa.html?quotationId=${quotationId}`;
            }
        }
        // Check for Supply & Installation category
        else if (category === 'Supply & Installation') {
            if (subcategory === 'Ducted Split') {
                redirectUrl = `duct_template_si.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Split') {
                redirectUrl = `split_template_si.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Floorstand') {
                redirectUrl = `floorstand_template_si.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Cassette') {
                redirectUrl = `cassette_template_si.html?quotationId=${quotationId}`;
            } else if (subcategory === 'Split&Floorstand') {
                redirectUrl = `split_floorstand_template_si.html?quotationId=${quotationId}`;
            }
        } else if (subcategory === 'AMC') {
            redirectUrl = `amc_template.html?quotationId=${quotationId}`;
        } else if (subcategory === 'Custom') {
            redirectUrl = `custom_quotation.html?quotationId=${quotationId}`;
        }else if (subcategory === 'Fan') {
            redirectUrl =  `fan_template.html?quotationId=${quotationId}`;
        }else if (subcategory === 'BOQ') {
            redirectUrl =  `boq_template.html?quotationId=${quotationId}`;
        }else if (subcategory === 'Spare Parts') {
            redirectUrl =  `spareparts_template.html?quotationId=${quotationId}`;
        }else {
            alert('Category or Subcategory not recognized. No action taken.');
        }

        // Redirect if a valid URL was generated
        if (redirectUrl) {
            window.open(redirectUrl, '_blank');  // Open in a new tab
        }
    }
});
