document.addEventListener('DOMContentLoaded', () => {
    const user = window.api.getCurrentUser();
    
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const roleInput = document.getElementById('profile-role');
    const profileForm = document.getElementById('profile-form');

    if (user && nameInput && emailInput && roleInput) {
        nameInput.value = user.name;
        emailInput.value = user.email;
        roleInput.value = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    } // If not logged in, api.js might redirect or it will just be blank

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!user) return alert('No active session.');

            try {
                // We use the existing PUT /api/users/:id endpoint
                const updatedData = await window.api.fetchAPI(`/users/${user.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: nameInput.value,
                        email: emailInput.value,
                        phone: user.phone || '', // Keep existing if needed
                        address: user.address || ''
                    })
                });
                
                // Update local storage so the sidebars visually update on next reload
                const updatedUser = { ...user, name: nameInput.value, email: emailInput.value };
                window.api.setCurrentUser(updatedUser);
                
                // Show floating toast notification
                if(window.toast) {
                    window.toast.show('Admin profile updated successfully!', 'success');
                } else {
                    alert('Profile updated successfully!');
                }
                
                setTimeout(() => location.reload(), 1500);

            } catch (err) {
                if(window.toast) {
                    window.toast.show('Failed to update: ' + err.message, 'error');
                } else {
                    alert('Error: ' + err.message);
                }
            }
        });
    }
});
