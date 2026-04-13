document.addEventListener('DOMContentLoaded', async () => {
    let allPopularItems = [];

    const tableBody = document.querySelector('.data-table tbody');
    const searchInput = document.querySelector('.search-input');

    function renderPopularItems(items) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        
        if (items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No matching items found.</td></tr>';
            return;
        }

        items.forEach(item => {
            let statusClass = item.status === 'BEST SELLER' ? 'status-green' : (item.status === 'TRENDING' ? 'status-orange' : '');
            let statusBadge = statusClass ? `<span class="status-badge ${statusClass}">${item.status}</span>` : `<span style="color:var(--text-light);font-size:0.8rem;">--</span>`;
            
            tableBody.innerHTML += `
                <tr>
                    <td>
                        <div class="flex items-center gap-3">
                            <img src="${item.img || 'https://via.placeholder.com/64'}" alt="${item.name}">
                            <span style="font-weight: 600;">${item.name}</span>
                        </div>
                    </td>
                    <td style="color: var(--text-gray);">${item.category}</td>
                    <td style="font-weight: 600;">${item.orders}</td>
                    <td style="font-weight: 600;">৳${parseFloat(item.revenue || 0).toLocaleString()}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        });
    }

    try {
        // Fetch real data
        const stats = await window.api.fetchAPI('/admin/stats');
        allPopularItems = stats.popularItems || [];
        
        const metricCards = document.querySelectorAll('.metric-card');
        if (metricCards.length >= 4) {
            metricCards[0].querySelector('.m-value').textContent = `৳${parseFloat(stats.revenue || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
            metricCards[1].querySelector('.m-value').textContent = (stats.orders || 0).toLocaleString();
            metricCards[2].querySelector('.m-value').textContent = `৳${parseFloat(stats.avgOrder || 0).toFixed(2)}`;
            metricCards[3].querySelector('.m-value').textContent = (stats.customers || 0).toLocaleString();
        }

        renderPopularItems(allPopularItems);

        // Sidebar Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const filtered = allPopularItems.filter(item => 
                    item.name.toLowerCase().includes(query) || 
                    item.category.toLowerCase().includes(query)
                );
                renderPopularItems(filtered);
            });
        }

    } catch (err) {
        console.error("Failed to load dashboard stats", err);
    }

    // --- Interactive Chart Filters ---
    const filterBtns = document.querySelectorAll('.t-filter');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parent = e.target.closest('.time-filters');
            if(parent) {
                parent.querySelectorAll('.t-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Simulate graph redraw by gently morphing the placeholder SVG path
                const pathEl = document.querySelector('.trend-chart svg path[stroke]');
                const fillEl = document.querySelector('.trend-chart svg path[fill="url(#gradient)"]');
                const labels = document.querySelectorAll('.trend-chart .flex.justify-between span');

                if (pathEl && fillEl) {
                    // Small animation delay simulation
                    pathEl.style.opacity = '0.3';
                    fillEl.style.opacity = '0.3';
                    
                    setTimeout(() => {
                        let newPath, newFill;
                        if (e.target.textContent.includes('90')) {
                            // 90 days generic path data
                            newPath = "M0,80 C100,50 150,180 250,110 C350,40 400,160 500,90";
                            newFill = "M0,80 C100,50 150,180 250,110 C350,40 400,160 500,90 L500,200 L0,200 Z";
                            if (labels.length >= 4) {
                                labels[0].innerText = "Oct"; labels[1].innerText = "Nov"; 
                                labels[2].innerText = "Dec"; labels[3].innerText = "Jan"; 
                                labels[4].innerText = "Feb"; labels[5].innerText = "Mar"; labels[6].innerText = "";
                            }
                        } else {
                            // 30 days generic path data
                            newPath = "M0,150 C50,150 100,180 150,130 C200,80 250,80 300,180 C350,280 400,-20 450,50 C480,90 500,120 500,120";
                            newFill = "M0,150 C50,150 100,180 150,130 C200,80 250,80 300,180 C350,280 400,-20 450,50 C480,90 500,120 500,120 L500,200 L0,200 Z";
                            if (labels.length >= 7) {
                                labels[0].innerText = "Mon"; labels[1].innerText = "Tue"; 
                                labels[2].innerText = "Wed"; labels[3].innerText = "Thu"; 
                                labels[4].innerText = "Fri"; labels[5].innerText = "Sat"; labels[6].innerText = "Sun";
                            }
                        }

                        pathEl.setAttribute('d', newPath);
                        fillEl.setAttribute('d', newFill);
                        pathEl.style.opacity = '1';
                        fillEl.style.opacity = '1';
                    }, 300);
                }
            }
        });
    });
});
