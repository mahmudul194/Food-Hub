document.addEventListener('DOMContentLoaded', () => {
    const user = window.api ? window.api.getCurrentUser() : null;
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    //UI Elements
    const avatarDisplay = document.getElementById('avatar-display');
    const avatarUpload = document.getElementById('avatar-upload');
    const sidebarName = document.getElementById('sidebar-name');
    const sidebarRole = document.getElementById('sidebar-role');
    
    const inputName = document.getElementById('input-name');
    const inputEmail = document.getElementById('input-email');
    const inputPhone = document.getElementById('input-phone');
    const inputAddress = document.getElementById('input-address');
    
    // Initialize standard details
    const initProfile = (userData) => {
        sidebarName.textContent = userData.name;
        sidebarRole.textContent = userData.role;
        
        inputName.value = userData.name || '';
        inputEmail.value = userData.email || '';
        inputPhone.value = userData.phone || '';
        inputAddress.value = userData.address || '';

        // Default or Custom Profile Picture
        if (userData.profile_picture) {
            avatarDisplay.src = userData.profile_picture;
        } else {
            avatarDisplay.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`;
        }
    };
    
    initProfile(user);

    let base64Image = user.profile_picture || null;

    // Handle Image Upload Conversion
    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic image validation
        if (!file.type.startsWith('image/')) {
            if (window.toast) window.toast.show('Please select an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            base64Image = reader.result;
            avatarDisplay.src = base64Image;
        };
        reader.readAsDataURL(file);
    });

    // Handle Form Submit
    const form = document.getElementById('user-profile-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('.btn-update');
        const origText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        try {
            const payload = {
                name: inputName.value,
                email: inputEmail.value,
                phone: inputPhone.value,
                address: inputAddress.value,
                profile_picture: base64Image
            };

            const response = await window.api.fetchAPI(`/users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            if (response.user) {
                // Ensure auth state is fully updated across tabs/reloads
                window.api.setCurrentUser(response.user);
                initProfile(response.user);
                if (window.toast) window.toast.show('Profile updated successfully!', 'success');
            }
        } catch (error) {
            if (window.toast) window.toast.show(error.message || 'Failed to update profile', 'error');
        } finally {
            btn.textContent = origText;
            btn.disabled = false;
        }
    });

    // Account Deletion Logic
    const deleteModal = document.getElementById('delete-modal');
    const btnDeleteAccount = document.getElementById('btn-delete-account');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    const modalCloseIcon = document.getElementById('modal-close-icon');

    const toggleModal = (show) => {
        if (show) {
            deleteModal.classList.add('active');
        } else {
            deleteModal.classList.remove('active');
        }
    };

    if (btnDeleteAccount) {
        btnDeleteAccount.addEventListener('click', () => toggleModal(true));
    }

    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', () => toggleModal(false));
    }

    if (modalCloseIcon) {
        modalCloseIcon.addEventListener('click', () => toggleModal(false));
    }

    // Close modal on click outside
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) toggleModal(false);
    });

    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', async () => {
            const origText = btnConfirmDelete.textContent;
            btnConfirmDelete.textContent = 'Deleting Account...';
            btnConfirmDelete.disabled = true;

            try {
                await window.api.fetchAPI(`/users/${user.id}`, {
                    method: 'DELETE'
                });

                if (window.toast) window.toast.show('Account deleted successfully. We\'re sorry to see you go!', 'success');
                
                // Wait for toast to be seen
                setTimeout(() => {
                    window.api.logout();
                }, 2000);
            } catch (error) {
                if (window.toast) window.toast.show(error.message || 'Failed to delete account', 'error');
                btnConfirmDelete.textContent = origText;
                btnConfirmDelete.disabled = false;
            }
        });
    }
});

