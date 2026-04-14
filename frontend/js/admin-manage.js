document.addEventListener('DOMContentLoaded', async () => {
    
    const tableBody = document.querySelector('#menu-table tbody');
    const restaurantSelect = document.getElementById('menu-restaurant-select');
    const form = document.getElementById('add-menu-form');

    // Load available restaurants
    async function loadRestaurants() {
        if (!restaurantSelect) return;
        try {
            const restaurants = await window.api.fetchAPI('/restaurants');
            restaurantSelect.innerHTML = restaurants.map(r => 
                `<option value="${r.id}">${r.name} (ID: ${r.id})</option>`
            ).join('');
            
            // Trigger initial menu load for selected restaurant
            if (restaurants.length > 0) {
                loadItems(restaurants[0].id);
            }
        } catch (err) {
            console.error(err);
            restaurantSelect.innerHTML = '<option value="">Failed to load restaurants</option>';
        }
    }

    // Load items for a specific restaurant
    async function loadItems(restaurantId) {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
        
        try {
            const items = await window.api.fetchAPI(`/restaurants/${restaurantId}/menu`);
            tableBody.innerHTML = '';
            
            if (items.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px; color: var(--text-gray);">No menu items found for this restaurant.</td></tr>';
                return;
            }

            items.forEach(item => {
                tableBody.innerHTML += `
                    <tr>
                        <td>
                            <div class="flex items-center gap-3">
                                <img src="${item.image_url}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200';">
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

    // Refresh menu on restaurant change
    if (restaurantSelect) {
        restaurantSelect.addEventListener('change', (e) => {
            loadItems(e.target.value);
        });
    }

    // Initial Load
    await loadRestaurants();

    // Hook up delete
    window.deleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await window.api.fetchAPI(`/admin/menu/${id}`, { method: 'DELETE' });
            window.toast.show('Item deleted successfully', 'success');
            loadItems(restaurantSelect.value); // refresh current restaurant
        } catch (err) {
            window.toast.show('Delete failed: ' + err.message, 'error');
        }
    };

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const payload = {
                restaurant_id: document.getElementById('menu-restaurant-select').value,
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
                
                window.toast.show('Item successfully added to Restaurant', 'success');
                form.reset();
                loadItems(payload.restaurant_id); // Refresh for correct restaurant
            } catch (err) {
                window.toast.show('Add failed: ' + err.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Add Menu Item';
            }
        });
    }

});
