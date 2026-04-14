document.addEventListener('DOMContentLoaded', () => {
    const user = window.api.getCurrentUser();
    
    // UI Elements
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');
    const roleInput = document.getElementById('profile-role');
    const profileForm = document.getElementById('profile-form');
    
    const avatarDisplay = document.getElementById('settings-avatar-display');
    const avatarUpload = document.getElementById('avatar-upload');

    let base64Image = user ? user.profile_picture : null;

    // Initialize Fields
    if (user) {
        if (nameInput) nameInput.value = user.name || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        if (roleInput) roleInput.value = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        
        if (avatarDisplay) {
            if (user.profile_picture) {
                avatarDisplay.src = user.profile_picture;
            } else {
                avatarDisplay.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
            }
        }
    }

    // Handle Image Upload
    if (avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                if (window.toast) window.toast.show('Please select an image file', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                base64Image = reader.result;
                if (avatarDisplay) avatarDisplay.src = base64Image;
            };
            reader.readAsDataURL(file);
        });
    }

    // Handle Form Submission
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!user) {
                if (window.toast) window.toast.show('No active session.', 'error');
                return;
            }

            const btn = profileForm.querySelector('button[type="submit"]');
            const origText = btn.textContent;
            btn.textContent = 'Saving...';
            btn.disabled = true;

            try {
                const payload = {
                    name: nameInput.value,
                    email: emailInput.value,
                    phone: phoneInput.value,
                    address: user.address || '', // Admins might not have addresses but we keep it
                    profile_picture: base64Image
                };

                const response = await window.api.fetchAPI(`/users/${user.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                
                if (response.user) {
                    window.api.setCurrentUser(response.user);
                    if (window.toast) window.toast.show('Admin profile updated successfully!', 'success');
                    
                    // Update sidebar elements immediately if they exist on the current page
                    const sidebarName = document.getElementById('admin-sidebar-name');
                    const sidebarAvatar = document.getElementById('admin-sidebar-avatar');
                    if (sidebarName) sidebarName.textContent = response.user.name;
                    if (sidebarAvatar) sidebarAvatar.src = response.user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.name)}&background=random`;
                }

            } catch (err) {
                if (window.toast) window.toast.show('Failed to update: ' + err.message, 'error');
            } finally {
                btn.textContent = origText;
                btn.disabled = false;
            }
        });
    }
});
