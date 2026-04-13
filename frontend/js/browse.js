document.addEventListener('DOMContentLoaded', async () => {
    
    // Check authentication
    const user = window.api ? window.api.getCurrentUser() : null;
    const btn = document.querySelector('.nav-actions .btn');
    if (user && btn && btn.textContent === 'Sign In') {
        btn.textContent = 'Sign Out';
        btn.href = '#';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.api.logout();
        });
    }

    const grid = document.querySelector('.restaurant-grid');
    if (!grid) return;

    let allRestaurants = [];
    const filterState = {
        category: 'All',
        searchTerm: '',
        minRating: 0,
        maxDeliveryTime: 999,
        sortBy: 'Relevance'
    };

    // Render function
    function renderRestaurants(list) {
        grid.innerHTML = '';
        if (list.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-gray); grid-column: 1/-1; text-align: center; padding: 40px;">No restaurants found matching your criteria.</p>';
            return;
        }

        list.forEach(r => {
            const card = document.createElement('div');
            card.className = 'restaurant-card';
            card.onclick = () => window.location.href = `restaurant.html?id=${r.id}`;

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${r.image_url}" alt="${r.name}">
                    <div class="rating-badge"><i class="ri-star-fill text-primary"></i> ${r.rating}</div>
                </div>
                <div class="card-content">
                    <div class="flex justify-between items-center" style="margin-bottom: 8px;">
                        <h4 class="card-title">${r.name}</h4>
                        <span class="delivery-time">${r.delivery_time}</span>
                    </div>
                    <p class="card-tags">${r.description}</p>
                    <div class="card-meta">
                        <span><i class="ri-bike-line"></i> Free Delivery</span>
                        <span><i class="ri-money-dollar-circle-line"></i> Min. ৳${r.min_order}</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function sortRestaurants(list) {
        if (filterState.sortBy === 'Rating') {
            return [...list].sort((a, b) => b.rating - a.rating);
        } else if (filterState.sortBy === 'Delivery') {
            return [...list].sort((a, b) => {
                const timeA = parseInt(a.delivery_time.split('-')[0]) || 999;
                const timeB = parseInt(b.delivery_time.split('-')[0]) || 999;
                return timeA - timeB;
            });
        }
        return list; // Relevance (default order)
    }

    function applyFilters() {
        let filtered = allRestaurants.filter(r => {
            const term = filterState.searchTerm.toLowerCase();
            const matchesSearch = r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term);
            const matchesCategory = filterState.category === 'All' ? true : r.description.toLowerCase().includes(filterState.category.toLowerCase());
            
            const matchesRating = parseFloat(r.rating) >= filterState.minRating;
            
            const deliveryMin = parseInt(r.delivery_time.split('-')[0]) || 0;
            const matchesDelivery = deliveryMin <= filterState.maxDeliveryTime;

            return matchesSearch && matchesCategory && matchesRating && matchesDelivery;
        });

        const sorted = sortRestaurants(filtered);
        renderRestaurants(sorted);
    }

    // Initial Load
    try {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Loading restaurants...</p>';
        allRestaurants = await window.api.fetchAPI('/restaurants');
        renderRestaurants(allRestaurants);
    } catch (err) {
        grid.innerHTML = `<p style="color:red; grid-column: 1/-1; text-align: center;">Error loading restaurants: ${err.message}</p>`;
    }

    // --- Filter UI interaction ---
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    const sortSelect = document.getElementById('sortSelect');
    const clearBtn = document.getElementById('clearFilters');
    const searchInput = document.querySelector('.search-input');

    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = filterDropdown.style.display === 'block';
            filterDropdown.style.display = isVisible ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            filterDropdown.style.display = 'none';
        });

        filterDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Radio button listeners
    document.querySelectorAll('input[name="rating"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            filterState.minRating = parseFloat(e.target.value);
            applyFilters();
        });
    });

    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            filterState.maxDeliveryTime = parseInt(e.target.value);
            applyFilters();
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-dropdown input[type="radio"]').forEach(r => r.checked = false);
            filterState.minRating = 0;
            filterState.maxDeliveryTime = 999;
            applyFilters();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            filterState.sortBy = e.target.value;
            applyFilters();
        });
    }

    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            
            // Sync active state icon styling
            categoryItems.forEach(c => {
                const icon = c.querySelector('.category-icon');
                if(icon) icon.classList.remove('text-primary', 'bg-secondary');
            });
            const selectedIcon = item.querySelector('.category-icon');
            if(selectedIcon) selectedIcon.classList.add('text-primary', 'bg-secondary');

            filterState.category = item.getAttribute('data-category');
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterState.searchTerm = e.target.value;
            applyFilters();
        });
    }

    // --- Load More functionality (Dummy) ---
    // Find all 'btn-outline' buttons, filter for the one that likely says "Load More"
    const loadMoreBtns = document.querySelectorAll('.btn-outline.text-primary');
    const loadMoreBtn = Array.from(loadMoreBtns).find(b => b.textContent.includes('Load More'));
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            const originalText = loadMoreBtn.innerText;
            loadMoreBtn.innerText = 'Loading...';
            loadMoreBtn.disabled = true;

            // Simulate network delay
            setTimeout(() => {
                // Simulate loading a new page by creating new mock locations
                const newItems = [...allRestaurants].map(r => ({ 
                    ...r, 
                    id: r.id + (+new Date() % 1000), // Randomize mock ID to avoid collisions
                    name: r.name + ' (New Location)' 
                }));
                allRestaurants = [...allRestaurants, ...newItems]; // Update master list
                
                applyFilters();

                loadMoreBtn.innerText = originalText;
                loadMoreBtn.disabled = false;
                
                // Hide button after loading once just to simulate reaching the end
                if (allRestaurants.length >= 6) {
                    loadMoreBtn.style.display = 'none';
                }
            }, 800);
        });
    }
});
