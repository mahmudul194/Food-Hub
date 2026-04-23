const fs = require('fs');
const path = require('path');

const files = [
    'frontend/dashboard.html',
    'frontend/admin-analytics.html',
    'frontend/admin-orders.html',
    'frontend/admin-manage.html',
    'frontend/admin-users.html',
    'frontend/admin-settings.html'
];

const buttonHtml = '<button class="btn btn-primary btn-full export-report-btn" style="margin-top: 20px;"><i class="ri-download-2-line" style="margin-right: 8px;"></i> Export Report</button>';

files.forEach(f => {
    const fullPath = path.join(__dirname, f);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        //remove existing variants of the button to avoid duplicates
        content = content.replace(/<button class="btn btn-primary btn-full".*?>\s*<i class="ri-download-2-line".*?<\/i>\s*Export Report\s*<\/button>/g, '');
        content = content.replace(/<button class="btn btn-primary btn-full export-report-btn".*?>\s*<i class="ri-download-2-line".*?<\/i>\s*Export Report\s*<\/button>/g, '');
        
        // Insert standardized button into .sidebar-footer
        if (content.includes('class="sidebar-footer"')) {
            content = content.replace(/(<div class="sidebar-footer">[\s\S]*?)<\/div>/, '$1\n                ' + buttonHtml + '\n            </div>');
            fs.writeFileSync(fullPath, content);
            console.log('Successfully updated ' + f);
        } else {
            console.log('Could not find sidebar-footer in ' + f);
        }
    } else {
        console.log('File not found: ' + f);
    }
});
