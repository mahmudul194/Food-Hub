// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    
    // Check if user is logged in
    const user = window.api ? window.api.getCurrentUser() : null;
    
    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('ri-eye-line');
            this.classList.toggle('ri-eye-off-line');
        });
    }

    // Welcome/Login screen specific logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        if (user) {
            // Already logged in, redirect to browse
            window.location.href = 'browse.html';
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button[type="submit"]');

            const originalText = btn.innerText;
            btn.innerText = 'Loging in...';
            btn.disabled = true;

            try {
                const response = await window.api.fetchAPI('/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                // Success
                window.api.setCurrentUser(response.user);
                
                // Redirect based on role
                if (response.user.role === 'admin') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'browse.html';
                }

            } catch (err) {
                window.toast.show('Login Failed: ' + err.message, 'error');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // Registration logic
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const btn = registerForm.querySelector('button[type="submit"]');

            const originalText = btn.innerText;
            btn.innerText = 'Creating Account...';
            btn.disabled = true;

            try {
                await window.api.fetchAPI('/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });

                window.toast.show('Registration successful! Please login.', 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
                
            } catch (err) {
                window.toast.show('Registration Failed: ' + err.message, 'error');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

});
