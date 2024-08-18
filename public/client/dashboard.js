document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/employees-expiring-soon');
        const employeesExpiringSoon = await response.json();

        if (employeesExpiringSoon.length > 0) {
            employeesExpiringSoon.forEach(employee => {
                alert(`Warning: The Qatar ID for ${employee.employee_name} (ID: ${employee.qatar_id}) is expiring on ${employee.expiry_date}`);
            });
        }
    } catch (err) {
        console.error('Error checking for expiring Qatar IDs:', err);
    }
});
