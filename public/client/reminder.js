document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/employees-expiring-soon-count');
        const data = await response.json();
        const notificationCount = parseInt(data.count, 10);

        if (notificationCount > 0) {
            // Find the specific QID div
            const qidDiv = document.querySelector('div.customer img[src="./images/qid.jpg"]');
            
            // Create the notification badge
            const notificationBadge = document.createElement('span');
            notificationBadge.textContent = notificationCount;
            notificationBadge.classList.add('notification-badge');

            // Append the badge to the QID div's parent element
            qidDiv.parentElement.appendChild(notificationBadge);
        }
    } catch (err) {
        console.error('Error fetching expiring employees count:', err);
    }
});
