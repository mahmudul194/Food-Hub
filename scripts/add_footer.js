const fs = require('fs');
const path = require('path');

const footerHtml = `
    <!-- Full Website Footer -->
    <footer class="site-footer">
        <div class="footer-grid">
            <div class="footer-col brand">
                <h4><i class="ri-restaurant-2-fill text-primary"></i> Food Hub</h4>
                <p>Bringing your favorite meals straight to your door. Fast, fresh, and perfectly delicious every time.</p>
            </div>
...
            <div class="footer-bottom">
            <div>&copy; 2026 Food Hub Bangladesh. All Rights Reserved.</div>
            <div class="footer-social">
                <a href="#"><i class="ri-facebook-circle-fill"></i></a>
                <a href="#"><i class="ri-twitter-x-line"></i></a>
                <a href="#"><i class="ri-instagram-line"></i></a>
            </div>
        </div>
    </footer>
`;

function processHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processHtmlFiles(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;

            // Remove existing footer tags and their contents
            // Simple replace: this regex removes anything between <footer ...> and </footer>
            // including the tags themselves.
            const footerRegex = /<footer[\s\S]*?<\/footer>/gi;
            if (footerRegex.test(content)) {
                content = content.replace(footerRegex, '');
            }

            // Insert new footer right before </body> or </html>
            if (content.includes('</body>')) {
                content = content.replace('</body>', footerHtml + '\n</body>');
                updated = true;
            } else if (content.includes('</html>')) {
                content = content.replace('</html>', footerHtml + '\n</html>');
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated footer in:', fullPath);
            }
        }
    });
}
//call the process
processHtmlFiles(path.join(__dirname, '..', 'frontend'));
console.log('Footer injected successfully.');
