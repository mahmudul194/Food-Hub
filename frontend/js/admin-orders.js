document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('ordersTableBody');
    
    async function loadOrders() {
        try {
            const orders = await window.api.fetchAPI('/admin/orders');
            tbody.innerHTML = '';
            
            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No orders found in database</td></tr>';
                return;
            }

            orders.forEach(order => {
                const tr = document.createElement('tr');
                const dateForm = new Date(order.created_at).toLocaleString();
                
                tr.innerHTML = `
                    <td>#${order.id}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.restaurant_name}</td>
                    <td style="font-weight:600; color:var(--primary-color);">৳${order.total_amount}</td>
                    <td>${order.payment_method || 'Card'}</td>
                    <td style="font-size: 0.85rem;">${dateForm}</td>
                    <td>
                        <select onchange="window.updateStatus(${order.id}, this.value)">
                            <option value="pending" ${order.status==='pending'?'selected':''}>Pending</option>
                            <option value="preparing" ${order.status==='preparing'?'selected':''}>Preparing</option>
                            <option value="out_for_delivery" ${order.status==='out_for_delivery'?'selected':''}>Out For Delivery</option>
                            <option value="delivered" ${order.status==='delivered'?'selected':''}>Delivered</option>
                            <option value="cancelled" ${order.status==='cancelled'?'selected':''}>Cancelled</option>
                        </select>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch(err) {
            console.error(err);
            tbody.innerHTML = `<tr><td colspan="7" style="color:red;">Failed to load orders</td></tr>`;
        }
    }

    window.updateStatus = async (id, newStatus) => {
        try {
            await window.api.fetchAPI(`/admin/orders/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            window.toast.show('Status updated successfully!', 'success');
            loadOrders();
        } catch(err) {
            window.toast.show('Failed to update: ' + err.message, 'error');
        }
    };

    loadOrders();
});
