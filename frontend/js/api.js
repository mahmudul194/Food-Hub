// Dynamically load toast.js
(function() {
    if (!document.getElementById('toast-script')) {
        const script = document.createElement('script');
        script.id = 'toast-script';
        script.src = 'js/toast.js';
        document.head.appendChild(script);
    }
})();

// API Base URL
const API_URL = '/api';

// Utility to handle JSON fetching
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Server error');
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Global user state functions
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('foodhub_user'));
}

function setCurrentUser(user) {
    localStorage.setItem('foodhub_user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('foodhub_user');
    window.location.href = 'index.html';
}


window.api = { fetchAPI, getCurrentUser, setCurrentUser, logout };

// Global UI initializers for Admin layouts
document.addEventListener('DOMContentLoaded', () => {
    const user = window.api.getCurrentUser();
    
    // Update admin profile elements
    const adminNameEl = document.querySelector('.admin-profile div div:first-child');
    const adminRoleEl = document.querySelector('.admin-profile div div:last-child');
    const avatarTextEl = document.querySelector('.avatar-text');
    const adminProfileEl = document.querySelector('.admin-profile');
    const notifBtn = document.querySelector('.ri-notification-3-line');
    
    if (user) {
        if (adminNameEl) adminNameEl.textContent = user.name;
        if (adminRoleEl) adminRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        
        // Update admin sidebar avatar if it exists
        const sidebarAvatar = document.getElementById('admin-sidebar-avatar');
        if (sidebarAvatar) {
            sidebarAvatar.src = user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
        }

        const sidebarName = document.getElementById('admin-sidebar-name');
        if (sidebarName) sidebarName.textContent = user.name;

        const sidebarRole = document.getElementById('admin-sidebar-role');
        if (sidebarRole) sidebarRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        
        if (avatarTextEl) {
            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            avatarTextEl.textContent = initials;
            avatarTextEl.style.cursor = 'pointer';
            avatarTextEl.title = 'Logout';
            avatarTextEl.addEventListener('click', () => window.api.logout());
        }

        if (adminProfileEl) {
            adminProfileEl.style.cursor = 'pointer';
            adminProfileEl.title = 'Profile Settings';
            adminProfileEl.addEventListener('click', () => {
                window.location.href = 'admin-settings.html';
            });
        }
    }

    if (notifBtn) {
        notifBtn.parentElement.style.cursor = 'pointer';
        notifBtn.parentElement.addEventListener('click', () => {
            if(window.toast) window.toast.show('No new notifications 🔔', 'info');
        });
    }

    // Customer Navigation: Dynamically inject "Order History" and "My Profile"
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && user) {
        // Remove Home link for logged-in users
        const homeLink = Array.from(navLinks.querySelectorAll('a')).find(a => 
            a.textContent.trim().toLowerCase() === 'home' || 
            a.getAttribute('href') === 'index.html'
        );
        if (homeLink) {
            homeLink.parentElement.remove();
        }

        // Add Order History if missing
        const hasOrders = Array.from(navLinks.querySelectorAll('a')).some(a => a.textContent.includes('Orders'));
        if (!hasOrders) {
            const isOrdersPage = window.location.pathname.includes('order-history.html');
            const classString = isOrdersPage ? 'class="text-primary font-weight-600"' : '';
            const li = document.createElement('li');
            li.innerHTML = `<a href="order-history.html" ${classString}>Orders</a>`;
            navLinks.appendChild(li);
        }

        // Convert 'Sign In' or 'Get Started' button to 'Logout'
        const navActions = document.querySelector('.nav-actions');
        const actionBtns = navActions ? navActions.querySelectorAll('.btn') : [];
        
        let logoutBtn = null;
        actionBtns.forEach(btn => {
            if (btn.textContent.trim() === 'Sign In' || btn.textContent.trim() === 'Get Started' || btn.textContent.trim() === 'Login' || btn.textContent.trim() === 'Logout') {
                btn.textContent = 'Logout';
                btn.href = '#';
                btn.classList.remove('btn-primary', 'btn-secondary');
                btn.classList.add('btn-outline');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.api.logout();
                });
                logoutBtn = btn;
            }
        });

        // Add Avatar if missing
        if (navActions && !document.querySelector('.nav-avatar-wrapper')) {
            const avatarWrapper = document.createElement('div');
            avatarWrapper.className = 'nav-avatar-wrapper';
            avatarWrapper.title = 'My Profile';
            
            const avatarImg = document.createElement('img');
            avatarImg.className = 'nav-avatar-img';
            avatarImg.src = user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
            avatarImg.alt = 'Profile';
            
            avatarWrapper.appendChild(avatarImg);
            avatarWrapper.addEventListener('click', () => {
                window.location.href = user.role === 'admin' ? 'admin-settings.html' : 'profile.html';
            });
            
            // Append after the logout button
            if (logoutBtn) {
                logoutBtn.insertAdjacentElement('afterend', avatarWrapper);
            } else {
                navActions.appendChild(avatarWrapper);
            }
        }
    }

    // Handle Mobile Menu (Hamburger)
    const navbar = document.querySelector('.navbar');
    let hamburger = document.querySelector('.hamburger');
    const navLinksList = document.querySelector('.nav-links');

    if (navbar && !hamburger && navLinksList) {
        hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '<i class="ri-menu-line"></i>';
        // Insert after logo
        const logo = navbar.querySelector('.logo');
        if (logo) logo.after(hamburger);
    }

    if (hamburger && navLinksList) {
        hamburger.addEventListener('click', () => {
            navLinksList.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinksList.classList.contains('active')) {
                icon.className = 'ri-close-line';
            } else {
                icon.className = 'ri-menu-line';
            }
        });

        // Close menu when clicking links
        navLinksList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksList.classList.remove('active');
                hamburger.querySelector('i').className = 'ri-menu-line';
            });
        });
    }

    // Dashboard Sidebar Toggle
    const sidebar = document.querySelector('.sidebar');
    const topbar = document.querySelector('.topbar');
    if (sidebar && topbar) {
        let sidebarToggle = document.querySelector('.sidebar-toggle');
        if (!sidebarToggle) {
            sidebarToggle = document.createElement('div');
            sidebarToggle.className = 'sidebar-toggle';
            sidebarToggle.innerHTML = '<i class="ri-menu-2-line"></i>';
            topbar.prepend(sidebarToggle);
        }

        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Export Report Multi-Page functionality
    const exportBtns = document.querySelectorAll('.export-report-btn');
    exportBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            if(window.toast) window.toast.show('Preparing business report...', 'info');
            
            try {
                const stats = await window.api.fetchAPI('/admin/stats');
                
                // Construct CSV content
                let csvContent = "";
                csvContent += "Category,Value\n";
                csvContent += `Total Revenue,BDT ${parseFloat(stats.revenue).toFixed(2)}\n`;
                csvContent += `Total Orders,${stats.orders}\n`;
                csvContent += `Avg Order Value,BDT ${parseFloat(stats.avgOrder).toFixed(2)}\n`;
                csvContent += `Total Customers,${stats.customers}\n`;
                csvContent += "\nTop Selling Items,Orders,Revenue\n";
                
                stats.popularItems.forEach(item => {
                    csvContent += `${item.name.replace(/,/g, '')},${item.orders},BDT ${parseFloat(item.revenue).toFixed(2)}\n`;
                });

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `Food Hub Report - ${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                if(window.toast) window.toast.show('Report exported successfully! 📊', 'success');
            } catch (err) {
                if(window.toast) window.toast.show('Export failed: ' + err.message, 'error');
            }
        });
    });
});

