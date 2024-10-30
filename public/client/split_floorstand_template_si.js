document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/splitfloorsi_template?quotationId=${quotationId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const { data } = await response.json();
        populateTable(data);
        
    } catch (error) {
        console.error('Error fetching quotation data:', error);
    }
});

function populateTable(data) {
    if (data.length > 0) {
        console.log("Customer Data: ", data[0]);
        const customerData = data[0];
        document.getElementById('customerName').textContent = customerData.customer_name || "\u00A0";
        document.getElementById('projectName').textContent = customerData.project_name || "\u00A0";
        document.getElementById('customerMob').textContent = customerData.mobile_no || "\u00A0";
        document.getElementById('customerEmail').textContent = customerData.email || "\u00A0";
        document.getElementById('fromName').textContent = customerData.salesperson_name || "\u00A0";
        document.getElementById('fromMob').textContent = customerData.salesperson_contact || "\u00A0";
        document.getElementById('refNo').textContent = customerData.quotation_id || "\u00A0";
        document.getElementById('date').textContent = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        const tableBody = document.getElementById('supplyTableBody');
        const descriptions = {};

        let totalTonQuantity = 0;
        let totalQuantity = 0;
        let totalSum = 0;

        const selectiveItems = [
            'DUCTED SPLIT UNITS',
            'WALL MOUNTED SPLIT UNITS',
            'CASSETTE',
            'FLOOR STAND',
            'FAN',
            'PACKAGE UNIT',
            'VRF CEILING CONCEALED',
            'VRF OUTDOOR UNITS'
        ];

        data.forEach(item => {
            console.log("Item: ", item);
            const description = item.type.toUpperCase();
            if (!descriptions[description]) {
                descriptions[description] = { count: 0, rows: [] };
            }
            descriptions[description].count++;
            descriptions[description].rows.push(item);

            const tonValue = parseFloat(item.ton);
            const quantity = parseFloat(item.quantity);

            if (!isNaN(tonValue)) {
                const tonQuantity = tonValue * quantity;
                totalQuantity += tonQuantity;
                totalTonQuantity += quantity;
            }

            totalSum += parseFloat(item.total_price);
        });

        Object.keys(descriptions).forEach(description => {
            const { count, rows } = descriptions[description];
            rows.forEach((item, index) => {
                const row = document.createElement('tr');
                if (index === 0) {
                    const descriptionCell = document.createElement('td');
                    descriptionCell.setAttribute('rowspan', count);
                    descriptionCell.className = 'merged-cell';

                    if (selectiveItems.includes(description)) {
                        descriptionCell.innerHTML = `<b><span style="color:black;">Supply Only of</span></b><br><b style="color:red;"> ${description}</b>`;
                    } else {
                        descriptionCell.innerHTML = `<b style="color:red; text-transform:uppercase;">${description}</b>`;
                    }
                    row.appendChild(descriptionCell);
                }

                row.innerHTML += `
                    <td>${item.ton}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit_price.toLocaleString()}</td>
                    <td>${item.total_price.toLocaleString()}</td>
                `;
                console.log("Row HTML: ", row.innerHTML);
                tableBody.appendChild(row);
            });
        });

        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td colspan="1" style="background-color: #b8cce4; color: black;"><b>Total</b></td>
            <td style="background-color: #b8cce4; color: black;"><b>${totalQuantity.toFixed(2)}</b></td>
            <td style="background-color: #b8cce4; color: black;"><b>${totalTonQuantity}</b></td>
            <td colspan="2" style="background-color: #b8cce4; color: black;"><b id="totalAmount">QAR ${totalSum.toLocaleString()}</b></td>
        `;
        tableBody.appendChild(totalRow);
        
        // Add the discount row (Initially hidden)
        const discountRow = document.createElement('tr');
        discountRow.innerHTML = `
            <td colspan="3" style="text-align: center;background-color: darkblue; color: white">
                <b>Total Amount After Discount</b>
            </td>
            <td colspan="2" style="text-align: center;background-color: darkblue; color: white">
                <b>QAR</b> <input type="text" id="amountInput" placeholder="Enter amount" class="no-border" style="font-weight: bold;color: white; height: 25px; font-size: 15.5px; width: 150px">
            </td>
        `;
        discountRow.id = 'totalAmountContainer';
        discountRow.style.display = 'none';  // Initially hidden
        tableBody.appendChild(discountRow);

        // Add a discount button
        const discountButton = document.createElement('button');
        discountButton.textContent = 'Apply Discount';
        discountButton.classList.add('hide-on-print');
        discountButton.style.marginTop = '10px';
        discountButton.addEventListener('click', () => {
            discountRow.style.display = discountRow.style.display === 'none' ? '' : 'none';
        });
        tableBody.appendChild(discountButton);

        const amountInput = document.getElementById('amountInput');
        const totalAmountElement = document.getElementById('totalAmount');

        if (amountInput) {
            amountInput.addEventListener('blur', formatAmount);
            amountInput.addEventListener('input', checkTotalDiscount);
        }

        function checkTotalDiscount() {
            const amountInputValue = amountInput.value.trim();
            if (amountInputValue === '') {
                totalAmountElement.style.textDecoration = 'none';
            } else {
                totalAmountElement.style.textDecoration = 'line-through';
            }
        }

        function formatAmount() {
            const value = parseFloat(this.value.replace(/,/g, ''));
            if (!isNaN(value)) {
                this.value = value.toLocaleString();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('./config.json')
        .then(response => response.json())
        .then(data => {
            // Update contact details
            document.getElementById('phoneNumber').textContent = data.phone;
            document.getElementById('emailAddress').textContent = data.email;
            document.getElementById('poBox').textContent = data.po_box;
            document.getElementById('phoneNumberArabic').textContent = data.phone;
            document.getElementById('emailAddressArabic').textContent = data.email;
            document.getElementById('poBoxArabic').textContent = data.po_box_arabic;

            // Update logos
            document.getElementById('leftLogo').src = data.left_logo;
            document.getElementById('centerLogo').src = data.center_logo;
            document.getElementById('rightLogo').src = data.right_logo;
        })
        .catch(error => console.error('Error loading data:', error));
});






   

   

let totalSum = 0; // Define totalSum globally



// Ensure this runs after DOM is fully loaded
window.onload = function() {
    // Add this to ensure that the functionality works after page load
    document.getElementById('amountInput')?.addEventListener('input', checkTotalDiscount);
};







document.getElementById('printButton').addEventListener('click', function() {
    // Fetch the quotation ID and customer name
    const quotationId = document.getElementById('refNo').textContent.trim();
    const customerName = document.getElementById('projectName').textContent.trim();

    // Set the document title to the desired filename format
    document.title = `${quotationId}_${customerName}`;

    // Trigger the print dialog
    window.print();
});

function goBack() {
    window.history.back();
}



// Fetch the content and convert it to HTML
async function fetchGoogleDocsContent() {
    try {
      // Fetch content from your backend route that retrieves Google Docs content
      const response = await fetch('/fetch-doc-splitfloorsi'); // Your API route
      const docContent = await response.json(); // Parse the JSON response
  
      // Convert JSON content to HTML
      const beforeTableHtml = convertGoogleDocsJsonToHtml(docContent.beforeTable);
      const afterTableHtml = convertGoogleDocsJsonToHtml(docContent.afterTable);
  
      // Insert the converted HTML into the designated sections before and after the table
      document.getElementById('content-before-table').innerHTML = beforeTableHtml; // Insert the "before table" content
      document.getElementById('content-after-table').innerHTML = afterTableHtml; // Insert the "after table" content
  
    } catch (error) {
      console.error('Error fetching Google Docs content:', error);
      document.getElementById('docContent').innerText = 'Failed to load content.';
    }
  }
  
  // Convert Google Docs JSON to HTML
  function convertGoogleDocsJsonToHtml(docContentArray) {
    let htmlContent = '';
    let inList = false;
    let currentListType = ''; // To track the current list type (ul or ol)

    // Iterate over each element in the document content array
    docContentArray.forEach(element => {
        // Handle paragraphs
        if (element.paragraph) {
            const paragraphText = element.paragraph.elements.map(e => {
                let text = e.textRun?.content || '';

                // Handle text styles (like bold, italic, underline, etc.)
                if (e.textRun?.textStyle) {
                    const { bold, italic, underline, fontSize, foregroundColor, backgroundColor, strikethrough } = e.textRun.textStyle;

                    if (bold) text = `<b>${text}</b>`;
                    if (italic) text = `<i>${text}</i>`;
                    if (underline) text = `<u>${text}</u>`;
                    if (strikethrough) text = `<del>${text}</del>`;

                    let style = '';
                    if (fontSize?.magnitude) {
                        style += `font-size: ${fontSize.magnitude}pt; `;
                    }
                    if (foregroundColor?.color?.rgbColor) {
                        const { red = 0, green = 0, blue = 0 } = foregroundColor.color.rgbColor;
                        const rgb = `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`;
                        style += `color: ${rgb}; `;
                    }
                    if (backgroundColor?.color?.rgbColor) {
                        const { red = 0, green = 0, blue = 0 } = backgroundColor.color.rgbColor;
                        const bgRgb = `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`;
                        style += `background-color: ${bgRgb}; `;
                    }

                    if (style) {
                        text = `<span style="${style}">${text}</span>`;
                    }
                }

                return text;
            }).join('');

            // Get paragraph style (line spacing, indent, space above/below)
            const paragraphStyle = element.paragraph.paragraphStyle || {};
            const lineSpacing = paragraphStyle.lineSpacing ? paragraphStyle.lineSpacing / 100 : 1.0; // Convert to CSS scale (default 1.0 if not provided)
            const spaceAbove = paragraphStyle.spaceAbove?.magnitude || 0;
            const spaceBelow = paragraphStyle.spaceBelow?.magnitude || 0;
            const indentFirstLine = paragraphStyle.indentFirstLine?.magnitude || 0;
            const indentStart = paragraphStyle.indentStart?.magnitude || 0;

            // Handle bullet or numbered lists
            if (element.paragraph.bullet) {
                const listId = element.paragraph.bullet.listId;

                // Check if the listId indicates an ordered list
                const isOrderedList = listId.startsWith("kix.") && element.paragraph.bullet.textStyle?.bold;

                const listType = isOrderedList ? 'ol' : 'ul';
                
                // If the list type changes, close the previous list and start a new one
                if (listType !== currentListType) {
                    if (inList) {
                        htmlContent += `</${currentListType}>`;
                    }
                    htmlContent += `<${listType}>`;
                    currentListType = listType;
                    inList = true;
                }

                htmlContent += `<li style="line-height: ${lineSpacing}; margin-top: ${spaceAbove}pt; margin-bottom: ${spaceBelow}pt; text-indent: ${indentFirstLine}pt;">${paragraphText}</li>`;
            } else {
                // If we're out of the list, close any open list tags
                if (inList) {
                    htmlContent += `</${currentListType}>`;
                    inList = false;
                    currentListType = ''; // Reset list type
                }

                // Apply line spacing, space above/below, and indentation
                htmlContent += `<p style="line-height: ${lineSpacing}; margin-top: ${spaceAbove}pt; margin-bottom: ${spaceBelow}pt; text-indent: ${indentFirstLine}pt; padding-left: ${indentStart}pt;">${paragraphText}</p>`;
            }
        }
    });

    // Close any open list at the end
    if (inList) {
        htmlContent += `</${currentListType}>`;
    }

    return htmlContent;
}
  
  // Call the function to fetch and display the content
  fetchGoogleDocsContent();
  