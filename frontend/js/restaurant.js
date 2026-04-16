document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    const user = window.api ? window.api.getCurrentUser() : null;
    const navActions = document.querySelector('.nav-actions');
    if (user && navActions) {
        // Swap User Icon for avatar logic or keep avatar
    }

    //Get ID from URL
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');

    try {
        if (!id) {
            // Fetch first available restaurant if no ID provided to prevent 404
            const allRestaurants = await window.api.fetchAPI('/restaurants');
            if (allRestaurants && allRestaurants.length > 0) {
                id = allRestaurants[0].id;
            } else {
                id = 1;
            }
        }

        // Fetch restaurant details
        const restaurant = await window.api.fetchAPI(`/restaurants/${id}`);
        
        // Update Hero Banner
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) heroBg.src = restaurant.image_url;
        
        const h1 = document.querySelector('.restaurant-info h1');
        if (h1) h1.textContent = restaurant.name;

        const meta = document.querySelector('.restaurant-info .meta');
        if (meta) meta.innerHTML = `${restaurant.description} • ${restaurant.delivery_time} • ৳ • <i class="ri-star-fill text-primary"></i> ${restaurant.rating} (500+ ratings)`;

        // Fetch menu
        const menuItems = await window.api.fetchAPI(`/restaurants/${id}/menu`);
        
        // Group items by category
        const categories = {};
        menuItems.forEach(item => {
            const cat = item.category || 'Other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(item);
        });

        // Get container
        const menuContainer = document.querySelector('.menu-content');
        if (!menuContainer) return;
        
        // Remove ALL hardcoded categories by clearing everything below .menu-categories
        const allDynamicNodes = Array.from(menuContainer.children).filter(child => 
            !child.classList.contains('restaurant-hero') && 
            !child.classList.contains('menu-categories')
        );
        allDynamicNodes.forEach(node => node.remove());

        // Dynamically build `.menu-categories` buttons matching available categories
        const menuCatsContainer = document.querySelector('.menu-categories');
        if (menuCatsContainer) {
            menuCatsContainer.innerHTML = '';
            let isFirst = true;

            for (const cat in categories) {
                const btn = document.createElement('button');
                btn.className = `menu-chip ${isFirst ? 'active' : ''}`;
                
                let icon = 'ri-restaurant-line';
                const lower = cat.toLowerCase();
                if(lower.includes('pizza')) icon = 'ri-pie-chart-2-line';
                else if(lower.includes('drink') || lower.includes('beverage')) icon = 'ri-cup-line';
                else if(lower.includes('popular')) icon = 'ri-fire-fill';
                else if(lower.includes('side') || lower.includes('starter')) icon = 'ri-bread-line';

                btn.innerHTML = `<i class="${icon}"></i> ${cat}`;
                const targetId = 'cat-' + cat.toLowerCase().replace(/[^a-z0-9]/g, '-');
                
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.menu-chip').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const targetEl = document.getElementById(targetId);
                    if(targetEl) {
                         const y = targetEl.getBoundingClientRect().top + window.scrollY - 100;
                         window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                });
                
                menuCatsContainer.appendChild(btn);
                isFirst = false;
            }
        }

        // Render each category section
        for (const [categoryName, items] of Object.entries(categories)) {
            const sectionId = 'cat-' + categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            const title = document.createElement('h3');
            title.className = 'section-title';
            title.id = sectionId;
            title.textContent = categoryName;
            title.style.marginTop = '40px';
            menuContainer.appendChild(title);

            // Determine layout type based on category
            const isMiniLayout = categoryName.toLowerCase().includes('drink') || categoryName.toLowerCase().includes('dessert') || categoryName.toLowerCase().includes('side');
            
            const grid = document.createElement('div');
            grid.className = isMiniLayout ? 'mini-menu-grid' : 'menu-grid';

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = isMiniLayout ? 'mini-menu-card' : 'menu-card';
                
                if (isMiniLayout) {
                    card.innerHTML = `
                        <img src="${item.image_url}" alt="${item.name}">
                        <div class="mini-card-details">
                            <h5>${item.name}</h5>
                            <p>${item.description}</p>
                            <div class="mini-card-bottom">
                                <span class="price">৳${item.price}</span>
                                <button class="round-add-btn add-btn"><i class="ri-add-line"></i></button>
                            </div>
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="item-img-container">
                            <img src="${item.image_url}" alt="${item.name}" class="item-image">
                        </div>
                        <div class="item-content">
                            <div class="item-header">
                                <h4>${item.name}</h4>
                                <span class="price text-primary">৳${item.price}</span>
                            </div>
                            <p class="description">${item.description}</p>
                            <button class="btn btn-primary btn-full add-btn">
                                <i class="ri-add-line"></i> Add to Cart
                            </button>
                        </div>
                    `;
                }
                
                const btn = card.querySelector('.add-btn');
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.cartManager) {
                        window.cartManager.addToCart({
                            id: item.id,
                            restaurant_id: id,
                            name: item.name,
                            price: parseFloat(item.price),
                            image_url: item.image_url
                        });
                        
                        // Success state icon
                        const originalHTML = this.innerHTML;
                        this.innerHTML = isMiniLayout ? '<i class="ri-check-line"></i>' : '<i class="ri-check-line"></i> Added';
                        this.style.backgroundColor = '#10B981';
                        this.style.color = 'white';
                        
                        setTimeout(() => {
                            this.innerHTML = originalHTML;
                            this.style.backgroundColor = '';
                            this.style.color = '';
                        }, 2000);
                    }
                });

                grid.appendChild(card);
            });
            menuContainer.appendChild(grid);
        }
        
    } catch (err) {
        console.error("Failed to load restaurant data", err);
    }
});

