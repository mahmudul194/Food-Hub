document.addEventListener('DOMContentLoaded', async () => {
    const user = window.api.getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const list = document.getElementById('orders-list');
    try {
        const orders = await window.api.fetchAPI(`/orders/user/${user.id}`);
        list.innerHTML = '';
        
        if (orders.length === 0) {
            list.innerHTML = '<p style="color:var(--text-gray);text-align:center;">You have no orders yet. Go add some food to your cart!</p>';
            return;
        }

        orders.forEach(order => {
            let itemsHtml = order.items.map(i => `<div class="o-item"><span>${i.quantity}x ${i.name}</span><span>৳${i.price}</span></div>`).join('');
            
            let statusClass = `status-${order.status}`;
            let statusLabel = order.status.replace(/_/g, ' ');

            list.innerHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <h3 style="margin-bottom: 4px;">${order.restaurant_name}</h3>
                            <div style="font-size: 0.85rem; color: var(--text-gray);">Order #${order.id} • ${new Date(order.created_at).toLocaleString()}</div>
                        </div>
                        <div>
                            <span class="status-badge ${statusClass}">${statusLabel}</span>
                        </div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        ${itemsHtml}
                    </div>
                    <div style="display:flex; justify-content:space-between; border-top: 1px dotted var(--border-color); padding-top: 16px;">
                        <div>
                             <div style="font-size: 0.8rem; color: var(--text-gray);">Payment: ${order.payment_method || 'Card'}</div>
                        </div>
                        <h3 class="text-primary">Total: ৳${parseFloat(order.total_amount).toFixed(2)}</h3>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        list.innerHTML = `<p style="color:red;">Error loading orders: ${err.message}</p>`;
    }
});
