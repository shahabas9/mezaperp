document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/employees-expiring-soon-count');
        const data = await response.json();
        const notificationCount = parseInt(data.count, 10);

        // Find the specific QID div
        const qidDiv = document.querySelector('div.customer img[src="./images/qid.jpg"]');
        const existingBadge = qidDiv.parentElement.querySelector('.notification-badge');

        if (notificationCount > 0) {
            if (!existingBadge) {
                // Create the notification badge
                const notificationBadge = document.createElement('span');
                notificationBadge.textContent = notificationCount;
                notificationBadge.classList.add('notification-badge');

                // Append the badge to the QID div's parent element
                qidDiv.parentElement.appendChild(notificationBadge);
            } else {
                // Update the existing badge count
                existingBadge.textContent = notificationCount;
            }
        } else {
            // Remove the badge if it exists and there's no expiring ID
            if (existingBadge) {
                existingBadge.remove();
            }
        }
    } catch (err) {
        console.error('Error fetching expiring employees count:', err);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/employees-expiring-soon');
        const employeesExpiringSoon = await response.json();

        if (employeesExpiringSoon.length > 0) {
            let alertMessage = 'Warning: The following employees have Qatar IDs expiring soon:\n';

            // Construct the alert message with all employee details
            employeesExpiringSoon.forEach(employee => {
                alertMessage += `\n- ${employee.employee_name} (ID: ${employee.qatar_id}) expiring on ${employee.expiry_date}`;
            });

            // Display the single alert with all the employee details
            alert(alertMessage);
        }
    } catch (err) {
        console.error('Error checking for expiring Qatar IDs:', err);
    }
});
