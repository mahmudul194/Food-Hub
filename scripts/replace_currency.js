const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.html') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
    //homecoming
}

const files = walk(path.join(__dirname, 'frontend'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    // Replace $ followed by numbers/commas/decimals
    const newContent = content.replace(/\$([0-9,.]+)/g, '৳$1');
    if (newContent !== content) {
        content = newContent;
        hasChanges = true;
    }

    // Replace ri-money-dollar-circle-line with a generic wallet or appropriate icon just in case
    // For Min. $15
    const newContent2 = content.replace(/Min\. \$/g, 'Min. ৳');
    if (newContent2 !== content) {
        content = newContent2;
        hasChanges = true;
    }

    if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});


