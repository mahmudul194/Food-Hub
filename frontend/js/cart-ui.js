document.addEventListener('DOMContentLoaded', () => {
    // 1. Listen for cart updates to re-render UI
    document.addEventListener('cartUpdated', (e) => {
        renderCartUI(e.detail.cart, e.detail.totals);
    });

    // 2. Initial render
    window.cartManager.triggerUpdate();

    // 3. Pre-fill Checkout Details if logged in
    const user = window.api.getCurrentUser();
    if (user && document.title.includes('Checkout')) {
        const addrText = document.getElementById('address-text');
        const phoneText = document.getElementById('phone-text');
        
        if (addrText) addrText.innerHTML = user.address || '123 Gourmet Avenue, Gastronomy District<br>Foodie City, FC 56789';
        if (phoneText) phoneText.textContent = user.phone || '+880 1711-001234';
    }

    // Change Address Logic
    const changeAddrBtn = document.getElementById('change-address-btn');
    if (changeAddrBtn) {
        changeAddrBtn.addEventListener('click', () => {
            if (changeAddrBtn.textContent === 'Change') {
                const addrText = document.getElementById('address-text');
                const lines = addrText.innerHTML.split('<br>').map(s => s.trim());
                addrText.innerHTML = `
                    <input type="text" id="addr-input-1" value="${lines[0] || ''}" style="width:100%; margin-bottom:8px; padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit;">
                    <input type="text" id="addr-input-2" value="${lines[1] || ''}" style="width:100%; padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit;">
                `;
                changeAddrBtn.textContent = 'Save';
                changeAddrBtn.classList.remove('btn-secondary');
                changeAddrBtn.classList.add('btn-primary');
            } else {
                const val1 = document.getElementById('addr-input-1').value;
                const val2 = document.getElementById('addr-input-2').value;
                document.getElementById('address-text').innerHTML = `${val1}<br>${val2}`;
                
                changeAddrBtn.textContent = 'Change';
                changeAddrBtn.classList.remove('btn-primary');
                changeAddrBtn.classList.add('btn-secondary');
                
                if(window.toast) window.toast.show('Address updated successfully!', 'success');
            }
        });
    }

    // Payment Tabs Logic
    const paymentTabs = document.querySelectorAll('.payment-tab');
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            paymentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    function renderCartUI(cart, totals) {
        // Render minimal cart icon counter in navbar if exists
        const navCartBadge = document.querySelector('.icon-btn .ri-shopping-cart-2-fill, .icon-btn .ri-shopping-bag-3-fill');
        if (navCartBadge && navCartBadge.parentElement) {
            let badge = navCartBadge.parentElement.querySelector('.badge-count');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge-count';
                badge.style.position = 'absolute';
                badge.style.top = '-5px';
                badge.style.right = '-5px';
                badge.style.backgroundColor = 'var(--primary-color)';
                badge.style.color = 'white';
                badge.style.borderRadius = '50%';
                badge.style.padding = '2px 6px';
                badge.style.fontSize = '0.7rem';
                navCartBadge.parentElement.style.position = 'relative';
                navCartBadge.parentElement.appendChild(badge);
            }
            badge.innerText = totals.count;
            badge.style.display = totals.count > 0 ? 'block' : 'none';
        }

        // --- Render Sidebar Cart (restaurant.html) ---
        const cartItemsContainer = document.querySelector('.cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div style="padding: 40px 20px; text-align: center;"><i class="ri-shopping-cart-line" style="font-size: 3rem; color: var(--border-color); display: block; margin-bottom: 10px;"></i><p style="color: var(--text-gray); font-size: 0.9rem;">Your cart is empty.</p></div>';
            } else {
                cart.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'cart-item';
                    itemDiv.innerHTML = `
                        <div class="item-qty">${item.quantity}</div>
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">৳${(item.price * item.quantity).toFixed(2)}</div>
                        <button class="remove-item" style="border:none; background:transparent; color: var(--text-light); cursor:pointer; margin-left:8px;"><i class="ri-close-circle-line"></i></button>
                    `;
                    itemDiv.querySelector('.remove-item').onclick = () => window.cartManager.removeFromCart(item.id);
                    cartItemsContainer.appendChild(itemDiv);
                });
            }

            // Update Subtotal/Total in sidebar
            const summaryContainer = document.querySelector('.cart-summary');
            if (summaryContainer) {
                 summaryContainer.innerHTML = `
                    <div class="summary-line">
                        <span>Subtotal</span>
                        <span style="font-weight: 600;">৳${totals.subtotal}</span>
                    </div>
                    <div class="summary-line">
                        <span>Delivery Fee</span>
                        <span style="color: #10B981; font-weight: 500;">${totals.deliveryFee}</span>
                    </div>
                    <div class="summary-line total-line">
                        <span>Total</span>
                        <span class="text-primary" style="font-size: 1.4rem;">৳${totals.total}</span>
                    </div>
                 `;
            }

            // Update Proceed to Checkout button state
            const sidebarCheckoutBtn = document.querySelector('.cart-sidebar .checkout-btn');
            if (sidebarCheckoutBtn) {
                sidebarCheckoutBtn.style.opacity = cart.length === 0 ? '0.5' : '1';
                sidebarCheckoutBtn.style.pointerEvents = cart.length === 0 ? 'none' : 'auto';
            }
        }

        // --- Render Checkout Items (checkout.html) ---
        const checkoutItemsContainer = document.querySelector('.checkout-items');
        if (checkoutItemsContainer) {
            checkoutItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                checkoutItemsContainer.innerHTML = '<p style="color: var(--text-gray); font-size: 0.9rem;">Your cart is empty.</p>';
            } else {
                cart.forEach(item => {
                    checkoutItemsContainer.innerHTML += `
                        <div class="checkout-item">
                            <img src="${item.image_url}" alt="${item.name}">
                            <div class="c-item-details">
                                <h5>${item.name}</h5>
                                <p>x${item.quantity} • Standard Prep</p>
                            </div>
                            <div class="c-item-price">৳${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `;
                });
            }
            
            // Update Totals in checkout
            const checkoutSummary = document.querySelector('.cart-summary'); // Assuming same class
            if (checkoutSummary && document.title.includes('Checkout')) {
                checkoutSummary.innerHTML = `
                    <div class="summary-line">
                        <span>Subtotal</span>
                        <span style="font-weight: 600;">৳${totals.subtotal}</span>
                    </div>
                    <div class="summary-line">
                        <span>Delivery Fee</span>
                        <span style="color: #10B981; font-weight: 500;">${totals.deliveryFee}</span>
                    </div>
                    <div class="summary-line">
                        <span>Taxes</span>
                        <span style="font-weight: 600;">৳${totals.taxes}</span>
                    </div>
                    <div class="summary-line total-line" style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border-color);">
                        <span>Total</span>
                        <span class="text-primary" style="font-size: 1.6rem;">৳${totals.total}</span>
                    </div>
                `;
            }
        }
    }

    // Bind Checkout Button Actions
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn && document.title.includes('Checkout')) {
        checkoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.cartManager.cart.length === 0) {
                window.toast.show('Your cart is empty!', 'error');
                return;
            }

            const user = window.api.getCurrentUser();
            if (!user) {
                window.toast.show('Please login to place an order.', 'info');
                setTimeout(() => window.location.href = 'index.html', 1500);
                return;
            }

            const btnOriginalText = checkoutBtn.innerText;
            checkoutBtn.innerHTML = 'Processing...';
            checkoutBtn.disabled = true;

            try {
                const totals = window.cartManager.getTotals();
                const activePayment = document.querySelector('.payment-tab.active span')?.innerText || 'Credit/Debit Card';
                
                // Get restaurant ID from first item or fallback to 1
                const restaurantId = window.cartManager.cart[0].restaurant_id || 1;

                await window.api.fetchAPI('/orders', {
                    method: 'POST',
                    body: JSON.stringify({
                        userId: user.id,
                        restaurantId: restaurantId,
                        items: window.cartManager.cart,
                        totalAmount: totals.total,
                        deliveryAddress: document.getElementById('address-text')?.innerText || '123 Gourmet Avenue, Foodie City, FC 56789',
                        paymentMethod: activePayment
                    })
                });

                window.toast.show('Order Placed Successfully! Your delicious meal is on its way. 🚀', 'success');
                window.cartManager.clearCart();
                setTimeout(() => window.location.href = 'order-history.html', 2000); 
            } catch(err) {
                window.toast.show('Checkout failed: ' + err.message, 'error');
                checkoutBtn.innerText = btnOriginalText;
                checkoutBtn.disabled = false;
            }
        });
    }
});

