// Cart Management using LocalStorage

class CartManager {
    constructor() {
        this.cartKey = 'foodhub_cart';
        this.cart = JSON.parse(localStorage.getItem(this.cartKey)) || [];
    }

    saveCart() {
        localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
    }
    

    addToCart(item) {
        // item: { id, name, price, image_url, restaurant_id }
        
        // Safety check: if adding item from a different restaurant, ask or clear (demo: just clear)
        if (this.cart.length > 0 && this.cart[0].restaurant_id != item.restaurant_id) {
            console.warn('Switching restaurant, clearing previous cart items');
            this.cart = [];
        }

        const existingItem = this.cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }
        this.saveCart();
        this.triggerUpdate();
        
        if (window.toast) window.toast.show('Added to cart!', 'success');
    }

    removeFromCart(id) {
        this.cart = this.cart.filter(i => i.id !== id);
        this.saveCart();
        this.triggerUpdate();
    }

    updateQuantity(id, quantity) {
        const item = this.cart.find(i => i.id === id);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(id);
            } else {
                item.quantity = Number(quantity);
                this.saveCart();
                this.triggerUpdate();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.triggerUpdate();
    }

    getTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal > 0 ? 0 : 0; 
        const taxes = subtotal * 0.05; // 5% tax 
        
        return {
            subtotal: subtotal.toFixed(2),
            deliveryFee: deliveryFee === 0 ? 'Free' : `৳${deliveryFee.toFixed(2)}`,
            taxes: taxes.toFixed(2),
            total: (subtotal + deliveryFee + taxes).toFixed(2),
            count: this.cart.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    triggerUpdate() {
        document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: this.cart, totals: this.getTotals() } }));
    }
}

window.cartManager = new CartManager();
