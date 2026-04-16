const fs = require('fs');
const files = [
    'frontend/admin-manage.html',
    'frontend/admin-analytics.html',
    'frontend/admin-orders.html',
    'frontend/admin-settings.html',
    'frontend/admin-users.html',
    'frontend/dashboard.html'
];
let count = 0;
//count
files.forEach(f => {
    if (fs.existsSync(f)) {
        let text = fs.readFileSync(f, 'utf8');
        const regex = /<div class="avatar-text.*?>.*?<\/div>/g;
        if (regex.test(text)) {
            text = text.replace(regex, '<button onclick="window.api.logout()" class="btn btn-outline" style="border-color:red; color:red; padding: 6px 16px;">Logout</button>');
            fs.writeFileSync(f, text);
            count++;
        }
    }
});
console.log('Replaced avatar text with logout button in ' + count + ' files.');
