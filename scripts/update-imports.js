const fs = require('fs');
const file = 'src/data/productImages.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\.jpg'/g, ".webp'");
content = content.replace(/\.jpeg'/g, ".webp'");
content = content.replace(/\.png'/g, ".webp'");
fs.writeFileSync(file, content);
console.log('updated productImages.js');
