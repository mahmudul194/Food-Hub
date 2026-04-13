document.addEventListener('DOMContentLoaded', async () => {
    
    const tableBody = document.querySelector('#menu-table tbody');

    // Load available items (assume displaying items from restaurant 1 for testing)
    async function loadItems() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
        
        try {
            // we have an endpoint /api/restaurants/1/menu
            const items = await window.api.fetchAPI(`/restaurants/1/menu`);
            tableBody.innerHTML = '';
            items.forEach(item => {
                tableBody.innerHTML += `
                    <tr>
                        <td>
                            <div class="flex items-center gap-3">
                                <img src="${item.image_url}" alt="${item.name}">
                                <div>
                                    <div style="font-weight: 600;">${item.name}</div>
                                    <div style="color: var(--text-gray); font-size: 0.8rem;">${item.category}</div>
                                </div>
                            </div>
                        </td>
                        <td style="font-weight: 600;">৳${parseFloat(item.price).toFixed(2)}</td>
                        <td>
                            <button onclick="deleteItem(${item.id})" class="btn btn-outline" style="border-color: red; color: red; padding: 6px 12px; border-radius: 6px;">Delete</button>
                        </td>
                    </tr>
                `;
            });
        } catch (err) {
             tableBody.innerHTML = `<tr><td colspan="3" style="color:red;">Error: ${err.message}</td></tr>`;
        }
    }

    loadItems();

    // Hook up delete
    window.deleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await window.api.fetchAPI(`/admin/menu/${id}`, { method: 'DELETE' });
            loadItems(); // refresh
        } catch (err) {
            window.toast.show('Delete failed: ' + err.message, 'error');
        }
    };

    // Form submit
    const form = document.getElementById('add-menu-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const payload = {
                restaurant_id: document.getElementById('menu-रेस्टوران্ট').value,
                name: document.getElementById('menu-name').value,
                category: document.getElementById('menu-category').value,
                price: parseFloat(document.getElementById('menu-price').value),
                description: document.getElementById('menu-desc').value,
                image_url: document.getElementById('menu-img').value
            };

            const btn = form.querySelector('button');
            btn.disabled = true;
            btn.innerText = 'Adding...';

            try {
                await window.api.fetchAPI('/admin/menu', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                
                window.toast.show('Item successfully added to Restaurant ID: ' + payload.restaurant_id, 'success');
                form.reset();
                loadItems();
            } catch (err) {
                window.toast.show('Add failed: ' + err.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Add Menu Item';
            }
        });
    }

});
