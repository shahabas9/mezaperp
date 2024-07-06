document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/splitvilla_template?quotationId=${quotationId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const { data } = await response.json();
        console.log('Fetched Data:', data);
        populateTable(data);
        generateSummaryTable(data);
    } catch (error) {
        console.error('Error fetching quotation data:', error);
    }
});

function normalizeLocation(location) {
    return location.toLowerCase().replace(/\s+/g, '');
}

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

        const tables = {
            basement: document.getElementById('basementTableBody'),
            mezzanine: document.getElementById('mezzanineTableBody'),
            groundfloor: document.getElementById('groundTableBody'),
            firstfloor: document.getElementById('firstTableBody'),
            penthouse: document.getElementById('penthouseTableBody'),
            outmajlis: document.getElementById('outmajlisTableBody'),
            outkitchen: document.getElementById('outkitchenTableBody'),
            outblock: document.getElementById('outblockTableBody')
        };

        const totals = {};

        data.forEach(item => {
            console.log('Item:', item);
            const normalizedLocation = normalizeLocation(item.location);
            const tableBody = tables[normalizedLocation];
            if (tableBody) {
                // Calculate totals
                if (!totals[normalizedLocation]) {
                    totals[normalizedLocation] = { quantity: 0, totalTonQuantity: 0.0 };
                }
                totals[normalizedLocation].quantity += item.quantity;
                totals[normalizedLocation].totalTonQuantity += parseFloat(item.ton) * item.quantity;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="serving-area">${item.area.toUpperCase()}</td>
                    <td class="quantity">${item.quantity}</td>
                    <td class="ton">${item.ton}</td>
                    <td class="description">${item.type.toUpperCase()}</td>
                `;
                tableBody.appendChild(row);
            } else {
                console.warn(`No table found for location: ${item.location}`);
            }
        });

        let totalQuantity = 0;
        let totalTonQuantity = 0.0;

        Object.values(totals).forEach(locationTotal => {
            totalQuantity += locationTotal.quantity;
            totalTonQuantity += locationTotal.totalTonQuantity;
        });

        document.getElementById('totalQuantityContainer').textContent = `Total Quantity: ${totalQuantity}`;
        document.getElementById('totalTonContainer').textContent = `Total Ton: ${totalTonQuantity.toFixed(2)} Ton`;

        const locationNames = {
            basement: 'الطابق السفلي',
            mezzanine: 'طابق الميزانين',
            groundfloor: 'الطابق الأرضي',
            firstfloor: 'الطابق الأول',
            penthouse: 'طابق السقيفة',
            outmajlis: 'أرضية خارج المجلس',
            outkitchen: 'أرضية المطبخ',
            outblock: 'أرضية خارجية'
        };

        // Add total row for each table
        Object.keys(tables).forEach(location => {
            mergeDescriptionCells(tables[location]);
            if (totals[location]) {
                const totalRow = document.createElement('tr');
                totalRow.innerHTML = `
                    <td><strong>${locationNames[location]}</strong></td>
                    <td><strong>${totals[location].quantity}</strong></td>
                    <td><strong>${totals[location].totalTonQuantity.toFixed(2)}</strong></td>
                    <td><strong>‫المجموع</strong></td>
                `;
                tables[location].appendChild(totalRow);
            }
        });

        // Hide tables and headings without data
        Object.keys(tables).forEach(key => {
            if (!tables[key].hasChildNodes()) {
                const wrapper = tables[key].closest('div');
                if (wrapper) {
                    wrapper.style.display = 'none';
                }
            }
        });
    }
}

function mergeDescriptionCells(tableBody) {
    const rows = tableBody.getElementsByTagName('tr');
    let lastDescription = '';
    let rowspan = 0;
    let lastTd = null;

    for (let i = 0; i < rows.length; i++) {
        const descriptionTd = rows[i].getElementsByClassName('description')[0];
        if (descriptionTd) {
            const currentDescription = descriptionTd.textContent.trim();
            if (currentDescription === lastDescription) {
                rowspan++;
                if (lastTd) {
                    lastTd.setAttribute('rowspan', rowspan);
                }
                descriptionTd.remove();
            } else {
                lastDescription = currentDescription;
                lastTd = descriptionTd;
                rowspan = 1;
            }
        }
    }
}



function generateSummaryTable(data) {
    const summary = {
        '1.00': { quantity: 0, ton: '1.00' },
        '1.50': { quantity: 0, ton: '1.50' },
        '2.00': { quantity: 0, ton: '2.00' },
        '2.50': { quantity: 0, ton: '2.50' },
        '3.00': { quantity: 0, ton: '3.00' }
    };

    console.log('Initial Summary:', summary);

    data.forEach(item => {
        if (item.type.toLowerCase() === 'wall mounted') {
            const ton = item.ton.toString();
            console.log('Processing item:', item);
            if (summary[ton]) {
                summary[ton].quantity += item.quantity;
            }
        }
    });

    console.log('Updated Summary:', summary);

    const summaryTableBody = document.getElementById('summaryTableBody');
    let descriptionAdded = false;
    let totalQuantity = 0;
    let totalPriceSum = 0; // To store total price sum

    Object.keys(summary).forEach((key, index) => {
        if (summary[key].quantity > 0) {
            totalQuantity += summary[key].quantity;

            const row = document.createElement('tr');
            if (!descriptionAdded) {
                row.innerHTML = `
                    <td class="total-price" data-ton="${summary[key].ton}">0</td> 
                    <td><input type="text" class="unit" data-ton="${summary[key].ton}" /></td>
                    <td>${summary[key].quantity}</td> 
                    <td>${summary[key].ton}</td>
                    <td rowspan="${Object.keys(summary).filter(k => summary[k].quantity > 0).length}" class="description-cell">WALL MOUNTED</td>
                `;
                descriptionAdded = true;
            } else {
                row.innerHTML = `
                    <td class="total-price" data-ton="${summary[key].ton}">0</td>
                    <td><input type="text" class="unit" data-ton="${summary[key].ton}" /></td>
                    <td>${summary[key].quantity}</td>
                    <td>${summary[key].ton}</td>
                `;
            }
            summaryTableBody.appendChild(row);
        }
    });

    // Create the total row
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td id="totalPriceSum" class="total-price-strike">0 ر.ق‬</td>
        <td></td>
        <td><b>${totalQuantity}</b></td>
        <td></td>
        <td><b>‫المجموع</b></td>
    `;
    summaryTableBody.appendChild(totalRow);

    // Add event listeners to unit price inputs
    document.querySelectorAll('.unit').forEach(input => {
        input.addEventListener('input', (event) => {
            const ton = event.target.getAttribute('data-ton');
            const unitPrice = parseFloat(event.target.value.replace(/,/g, '')) || 0; // Remove commas for parsing
            const formattedUnitPrice = unitPrice.toLocaleString();
            event.target.value = formattedUnitPrice;

            const quantity = summary[ton].quantity;
            const totalPrice = unitPrice * quantity;
            document.querySelector(`.total-price[data-ton="${ton}"]`).textContent = totalPrice.toLocaleString();

            // Update total price sum
            updateTotalPriceSum();
        });
    });

    function updateTotalPriceSum() {
        totalPriceSum = 0;
        document.querySelectorAll('.total-price').forEach(cell => {
            totalPriceSum += parseFloat(cell.textContent.replace(/,/g, '')) || 0;
        });
        document.getElementById('totalPriceSum').textContent = `${totalPriceSum.toLocaleString()} ر.ق `;
    }
}

// CSS to center the description text
const style = document.createElement('style');
style.textContent = `
    .description-cell {
        text-align: center;
        vertical-align: middle;
    }
`;
document.head.append(style);



