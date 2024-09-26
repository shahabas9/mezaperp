function loadGoogleAPI() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: 'AIzaSyDEvuOIfRIrIaGnpMMu0n0xBdcyGehtJvw',
        clientId: '107445650529496083729.apps.googleusercontent.com',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        scope: 'https://www.googleapis.com/auth/drive.file'
    }).then(function () {
        gapi.auth2.getAuthInstance().signIn().then(function() {
            console.log("User signed in");
            // Optionally, handle token storage or send token to backend
        });
    });
}

async function fetchGoogleDocsContent() {
    try {
      const response = await fetch('/fetch-doc-content'); // Your API route to get the Google Docs content
      const docContent = await response.json(); // Get the JSON response
      
      // Convert JSON to HTML
      const htmlContent = convertGoogleDocsJsonToHtml(docContent);
      
      // Display the content in the #docContent div
      document.getElementById('docContent').innerHTML = htmlContent;
    } catch (error) {
      console.error('Error fetching Google Docs content:', error);
      document.getElementById('docContent').innerText = 'Failed to load content.';
    }
  }

  function convertGoogleDocsJsonToHtml(docContent, inlineObjects) {
    let htmlContent = '';
    let inList = false; // To track if we're inside a list
    

// Inspect all inline object IDs
    
  docContent.body.content.forEach(element => {
    // Handle paragraphs
    if (element.paragraph) {
      const paragraphText = element.paragraph.elements.map(e => {
        let text = e.textRun?.content || '';

        // Handle inline objects like images (referenced by inlineObjectId)
        if (e.inlineObjectElement) {
          const inlineObjectId = e.inlineObjectElement.inlineObjectId;
          
          // Debug: Log inlineObjectId to check
          console.log('Checking inlineObjectElement with ID:', inlineObjectId);

          // Check if inlineObjects and the specific inlineObjectId exist
          if (inlineObjects && inlineObjects[inlineObjectId]) {
            const inlineObject = inlineObjects[inlineObjectId];
            
            if (inlineObject && inlineObject.inlineObjectProperties && inlineObject.inlineObjectProperties.embeddedObject) {
              const imageProperties = inlineObject.inlineObjectProperties.embeddedObject.imageProperties;
              if (imageProperties && imageProperties.contentUri) {
                const imageUrl = imageProperties.contentUri;
                
                // Debug: log the image URL
                console.log('Image URL:', imageUrl);

                // Add the image to the HTML content
                text += `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto;">`;
              } else {
                console.warn('No contentUri found for imageProperties:', imageProperties);
              }
            } else {
              console.warn('No inlineObject or embeddedObject found for ID:', inlineObjectId);
            }
          } else {
            console.warn(`Inline object with ID ${inlineObjectId} is missing or undefined`);
          }
        }

        // Handle text styles (like bold, italic, underline, etc.)
        if (e.textRun?.textStyle) {
          const { bold, italic, underline, fontSize, foregroundColor, strikethrough } = e.textRun.textStyle;

          if (bold) text = `<b>${text}</b>`;
          if (italic) text = `<i>${text}</i>`;
          if (underline) text = `<u>${text}</u>`;
          if (strikethrough) text = `<del>${text}</del>`; // Strikethrough

          let style = '';
          if (fontSize?.magnitude) {
            style += `font-size: ${fontSize.magnitude}pt; `;
          }
          if (foregroundColor?.color?.rgbColor) {
            const { red = 0, green = 0, blue = 0 } = foregroundColor.color.rgbColor;
            const rgb = `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`;
            style += `color: ${rgb}; `;
          }

          if (style) {
            text = `<span style="${style}">${text}</span>`;
          }
        }

        return text;
      }).join('');

      // Handle paragraph and bullet lists (as before)
      if (element.paragraph.bullet) {
        if (!inList) {
          const listType = element.paragraph.bullet.listId.includes('ordered') ? 'ol' : 'ul';
          htmlContent += `<${listType}>`;
          inList = true;
        }
        htmlContent += `<li>${paragraphText}</li>`;
      } else {
        if (inList) {
          htmlContent += '</ul>';
          inList = false;
        }
        const indentFirstLine = element.paragraph.paragraphStyle?.indentFirstLine?.magnitude || 0;
        htmlContent += `<p style="text-indent: ${indentFirstLine}pt;">${paragraphText}</p>`;
      }
    }

    // Handle tables
    if (element.table) {
      htmlContent += '<table border="1">';
      element.table.tableRows.forEach(row => {
        htmlContent += '<tr>';
        row.tableCells.forEach(cell => {
          const cellContent = cell.content.map(c => 
            c.paragraph?.elements.map(e => {
              let text = e.textRun?.content || '';

              // Skip rendering empty cells
              if (!text.trim()) {
                return ''; // Skip this cell if no meaningful content
              }

              // Handle text styles within table cells
              if (e.textRun?.textStyle) {
                const { bold, italic, underline, fontSize, foregroundColor, strikethrough } = e.textRun.textStyle;

                // Apply text styles (bold, italic, underline, strikethrough)
                if (bold) text = `<b>${text}</b>`;
                if (italic) text = `<i>${text}</i>`;
                if (underline) text = `<u>${text}</u>`;
                if (strikethrough) text = `<del>${text}</del>`; // Add strikethrough

                // Apply font size if available
                let style = '';
                if (fontSize?.magnitude) {
                  style += `font-size: ${fontSize.magnitude}pt; `;
                }

                
                // Apply font color if available
                if (foregroundColor?.color?.rgbColor) {
                  const { red = 0, green = 0, blue = 0 } = foregroundColor.color.rgbColor;
                  const rgb = `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`;
                  style += `color: ${rgb}; `;
                }

                // Wrap the text in a span if there are any styles applied
                if (style) {
                  text = `<span style="${style}">${text}</span>`;
                }
              }

              return text;
            }).join('')
          ).join('');

          // Skip empty cells
          if (!cellContent.trim()) {
            return; // Don't render this cell if it's empty
          }

          // Handle merged cells
          let colSpan = cell.tableCellStyle?.columnSpan || 1;
          let rowSpan = cell.tableCellStyle?.rowSpan || 1;

          // Handle background color
          let bgColor = '';
          if (cell.tableCellStyle?.backgroundColor?.color?.rgbColor) {
            const { red = 0, green = 0, blue = 0 } = cell.tableCellStyle.backgroundColor.color.rgbColor;
            const bgRgb = `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`;
            bgColor = `background-color: ${bgRgb}; `;
          }

          // Handle text alignment
          let textAlign = '';
          if (cell.content[0]?.paragraph?.paragraphStyle?.alignment) {
            textAlign = `text-align: ${cell.content[0].paragraph.paragraphStyle.alignment.toLowerCase()}; `;
          }

          let cellStyle = `${bgColor}${textAlign}`;// Remove background color logic

          // Add the cell with rowspan and colspan if applicable
          htmlContent += `<td colspan="${colSpan}" rowspan="${rowSpan}" style="${cellStyle}">${cellContent}</td>`;
        });
        htmlContent += '</tr>';
      });
      htmlContent += '</table>';
    }
  });

  // Close the list if it's still open
  if (inList) {
    htmlContent += '</ul>';
  }

  return htmlContent;
}


  // Call the function to fetch and display the content
  fetchGoogleDocsContent();

  document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('quotationId');
    
    if (!quotationId) {
        console.error('Quotation ID not provided');
        return;
    }

    try {
        const response = await fetch(`/api/custom_template?quotationId=${quotationId}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const { data } = await response.json();
        if (!data || data.length === 0) {
            throw new Error('No data found');
        }

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
    }
  }

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