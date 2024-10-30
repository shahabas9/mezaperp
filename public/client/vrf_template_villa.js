document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/vrf_villa_template?quotationId=${quotationId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const { data } = await response.json();
        console.log('Fetched Data:', data);
        populateTable(data);
        
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

        const tables = {
            basement: document.getElementById('basementTableBody'),
            mezzanine: document.getElementById('mezzanineTableBody'),
            groundfloor: document.getElementById('groundTableBody'),
            firstfloor: document.getElementById('firstTableBody'),
            penthouse: document.getElementById('penthouseTableBody'),
            outmajlis: document.getElementById('outmajlisTableBody'),
            outkitchen: document.getElementById('outkitchenTableBody'),
            outblock: document.getElementById('outblockTableBody'),
            groundfloorVrfOutdoor: document.getElementById('groundfloorVrfOutdoorTableBody'),
            firstfloorVrfOutdoor: document.getElementById('firstfloorVrfOutdoorTableBody'),
            penthouseVrfOutdoor: document.getElementById('penthouseVrfOutdoorTableBody'),
            outmajlisVrfOutdoor: document.getElementById('outmajlisVrfOutdoorTableBody'),
            outkitchenVrfOutdoor: document.getElementById('outkitchenVrfOutdoorTableBody'),
            outblockVrfOutdoor: document.getElementById('outblockVrfOutdoorTableBody')
        };

        const totals = {};

        const descriptionMapping = {
            "WALL MOUNTED": "‫وحدات تكييف معلق على الحائط سبلت <br><span style='color: red;'>(Wall Mounted)</span>",
            "DUCTED SPLIT": "وحدات‬ تكييف سقف‬‬ ‫مخفي‬ بمجاري هواء‬‬ ‫ ‫ <br><span style='color: red;'>(Ducted Split)</span>",
            "VRF CEILING CONCEALED": "وحدات‬ تكييف سقف‬‬ ‫مخفي‬ بمجاري هواء‬‬ ‫ ‫ <br><span style='color: red;'>(VRF Ceiling Concealed)</span>",
            "VRF OUTDOOR UNIT": "‫وحدات‬ ‫تكييف‬ ‫خارجية‬ <br><span style='color: red;'>(VRF Outdoor Unit)</span>"
        };

        let totalDuctSplit = 0;
        let totalWallMounted = 0;
        let totalVRF = 0;

        const vrfOutdoorTotals = {};

        data.forEach(item => {
            const normalizedLocation = normalizeLocation(item.location);
            const tableBody = tables[normalizedLocation];
            if (tableBody) {
                if (item.type.toLowerCase() !== 'vrf outdoor unit') {
                    // Calculate totals
                    if (!totals[normalizedLocation]) {
                        totals[normalizedLocation] = { quantity: 0, totalTonQuantity: 0.0 };
                    }
                    totals[normalizedLocation].quantity += item.quantity;
                    totals[normalizedLocation].totalTonQuantity += parseFloat(item.ton) * item.quantity;
                }

                const descriptionText = descriptionMapping[item.type.toUpperCase()] || item.type.toUpperCase();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="serving-area">${item.area.toUpperCase()}</td>
                    <td class="quantity">${item.quantity}</td>
                    <td class="ton">${item.ton}</td>
                    <td class="description"><strong>${descriptionText}</strong></td>
                `;

                if (item.type.toLowerCase() === 'vrf outdoor unit') {
                    tables[`${normalizedLocation}VrfOutdoor`].appendChild(row);
                } else {
                    tableBody.appendChild(row);

                    if (item.type.toLowerCase() === 'ducted split') {
                        totalDuctSplit += item.quantity;
                    } else if (item.type.toLowerCase() === 'wall mounted') {
                        totalWallMounted += item.quantity;
                    } else if (item.type.toLowerCase() === 'vrf ceiling concealed') {
                        totalVRF += item.quantity;

                        // Calculate VRF Outdoor Unit total for the floor
                        if (!vrfOutdoorTotals[normalizedLocation]) {
                            vrfOutdoorTotals[normalizedLocation] = 0;
                        }
                        vrfOutdoorTotals[normalizedLocation] += parseFloat(item.ton) * item.quantity;
                    }
                }
            } else {
                console.warn(`No table found for location: ${item.location}`);
            }
        });
        console.log(`Total Wall Mounted Units: ${totalWallMounted}`);
        console.log(`Total VRF Units: ${totalVRF}`);
        let totalQuantity = 0;
        let totalTonQuantity = 0.0;

        Object.values(totals).forEach(locationTotal => {
            totalQuantity += locationTotal.quantity;
            totalTonQuantity += locationTotal.totalTonQuantity;
        });

        document.getElementById('totalQuantityContainer').textContent = ` ${totalQuantity}`;
        document.getElementById('totalTonContainer').textContent = ` ${totalTonQuantity.toFixed(2)} `;

        const locationNames = {
            basement: 'الطابق السفلي',
            mezzanine: 'طابق الميزانين',
            groundfloor: '‫الطابق‬ ‫الارضي‬',
            firstfloor: '‫الطابق‬ ‫‫‬ال‫ا‬‬ول',
            penthouse: 'البنت‬ ‫هاوس',
            outmajlis: '‫المجلس‬ ‫الخارجي',
            outkitchen: 'أرضية المطبخ',
            outblock: '‫مجموع‬ ‫المشروع‬‬‬'
        };

        // Add total row for each table
        Object.keys(tables).forEach(location => {
            mergeDescriptionCells(tables[location]);
            if (totals[location] && location.indexOf('VrfOutdoor') === -1) {
                const totalRow = document.createElement('tr');
                totalRow.innerHTML = `
                    <td style="background-color: darkblue; color: white;"><strong>${locationNames[location]}</strong></td>
                    <td style="background-color: darkblue; color: white;"><strong>${totals[location].quantity}</strong></td>
                    <td style="background-color: darkblue; color: white;"><strong>${totals[location].totalTonQuantity.toFixed(2)}</strong></td>
                    <td style="background-color: darkblue; color: white;"><strong>‫المجموع</strong></td>
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

        document.getElementById('totalDuctsplitContainer').innerHTML += ` <strong>${totalDuctSplit}</strong>`;
        document.getElementById('totalWallmountedContainer').innerHTML += ` <strong>${totalWallMounted}</strong>`;
        document.getElementById('totalVrfMachines').innerHTML += ` <strong>${totalVRF}</strong>`;

        // Hide list items if totals are zero
        if (totalDuctSplit === 0) {
            document.getElementById('totalDuctsplitContainer').style.display = 'none';
        }
        if (totalWallMounted === 0) {
            document.getElementById('totalWallmountedContainer').style.display = 'none';
        }
        if (totalVRF === 0) {
            document.getElementById('totalVrfMachines').style.display = 'none';
        }
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

const style = document.createElement('style');
style.textContent = `
    .description-cell {
        text-align: center;
        vertical-align: middle;
    }
`;
document.head.append(style);

const amountInput = document.getElementById('amountInput');
const discountInput = document.getElementById('discountInput');

    // amountInput.addEventListener('blur', formatAmount);
    // amountInput.addEventListener('input', clearFormatting);

    // discountInput.addEventListener('blur', formatAmount);
    // discountInput.addEventListener('input', clearFormatting);

    function clearFormatting() {
        this.value = this.value.replace(/,/g, '');
    }

    function formatAmount() {
        const value = parseFloat(this.value.replace(/,/g, ''));
        if (!isNaN(value)) {
            this.value = value.toLocaleString();
        }
    }

    document.getElementById('printButton').addEventListener('click', function() {
        // Fetch the quotation ID and customer name
        const quotationId = document.getElementById('refNo').textContent.trim();
        const customerName = document.getElementById('customerName').textContent.trim();
    
        // Set the document title to the desired filename format
        document.title = `${quotationId}_${customerName}`;
    
        // Trigger the print dialog
        window.print();
    });

function goBack() {
    window.history.back();
}


async function fetchGoogleDocsContent() {
    try {
      // Fetch content from your backend route that retrieves Google Docs content
      const response = await fetch('/fetch-doc-villavrf'); // Your API route
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
    let currentListType = ''; // Track current list type (ul or ol)
    let currentNestingLevel = 0; // Track current nesting level

    docContentArray.forEach(element => {
        if (element.paragraph) {
            const paragraphText = element.paragraph.elements.map(e => {
                let text = e.textRun?.content || '';

                // Handle text styles
                if (e.textRun?.textStyle) {
                    const { bold, italic, underline, fontSize, foregroundColor, backgroundColor, strikethrough } = e.textRun.textStyle;

                    if (bold) text = `<b>${text}</b>`;
                    if (italic) text = `<i>${text}</i>`;
                    if (underline) text = `<u>${text}</u>`;
                    if (strikethrough) text = `<del>${text}</del>`;

                    let style = '';
                    if (fontSize?.magnitude) style += `font-size: ${fontSize.magnitude}pt; `;
                    if (foregroundColor?.color?.rgbColor) {
                        const { red = 0, green = 0, blue = 0 } = foregroundColor.color.rgbColor;
                        style += `color: rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}); `;
                    }
                    if (backgroundColor?.color?.rgbColor) {
                        const { red = 0, green = 0, blue = 0 } = backgroundColor.color.rgbColor;
                        style += `background-color: rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}); `;
                    }

                    if (style) text = `<span style="${style}">${text}</span>`;
                }

                return text;
            }).join('');

            const paragraphStyle = element.paragraph.paragraphStyle || {};
            const lineSpacing = paragraphStyle.lineSpacing ? paragraphStyle.lineSpacing / 100 : 1.0;
            const spaceAbove = paragraphStyle.spaceAbove?.magnitude || 0;
            const spaceBelow = paragraphStyle.spaceBelow?.magnitude || 0;
            const indentFirstLine = paragraphStyle.indentFirstLine?.magnitude || 0;
            const indentStart = paragraphStyle.indentStart?.magnitude || 0;

            let alignment = paragraphStyle.alignment ? paragraphStyle.alignment.toLowerCase() : 'right';
            let direction = paragraphStyle.direction === 'RIGHT_TO_LEFT' ? 'rtl' : 'ltr';

            // Handle lists using bullet properties
            if (element.paragraph.bullet) {
                const nestingLevel = element.paragraph.bullet.nestingLevel || 0;

                // Check for the presence of a bullet list
                const isOrderedList = element.paragraph.bullet && element.paragraph.bullet.listId && element.paragraph.bullet.listId.startsWith("kix.");
                const listType = (isOrderedList && nestingLevel === 0) ? 'ol' : 'ul';
                

                // Handle nesting level changes
                while (currentNestingLevel < nestingLevel) {
                    htmlContent += `<ul style="list-style-type:disc; text-align: ${alignment}; direction: ${direction};">`;
                    currentNestingLevel++;
                }

                while (currentNestingLevel > nestingLevel) {
                    htmlContent += `</ul>`;
                    currentNestingLevel--;
                }

                // Only switch between `ol` and `ul` if outside of a nested list
                if (nestingLevel === 0 && listType !== currentListType) {
                    if (inList) {
                        htmlContent += `</${currentListType}>`;
                    }
                    htmlContent += `<${listType} style="text-align: ${alignment}; direction: ${direction};">`;
                    currentListType = listType;
                    inList = true;
                }

                htmlContent += `<li style="line-height: ${lineSpacing}; margin-top: ${spaceAbove}pt; margin-bottom: ${spaceBelow}pt; text-indent: ${indentFirstLine}pt; padding-left: ${indentStart}pt;">${paragraphText}</li>`;
            } else {
                if (inList) {
                    htmlContent += `</${currentListType}>`;
                    inList = false;
                    currentListType = '';
                    currentNestingLevel = 0;
                }

                htmlContent += `<p style="line-height: ${lineSpacing}; margin-top: ${spaceAbove}pt; margin-bottom: ${spaceBelow}pt; text-indent: ${indentFirstLine}pt; padding-left: ${indentStart}pt; text-align: ${alignment}; direction: ${direction};">${paragraphText}</p>`;
            }
        }
    });

    // Close any remaining open lists
    while (currentNestingLevel > 0) {
        htmlContent += `</ul>`;
        currentNestingLevel--;
    }

    return htmlContent;
}

  
  // Call the function to fetch and display the content
  fetchGoogleDocsContent();
