const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const updated = content.replace(/\.jpg['"]/g, ".webp'").replace(/\.jpeg['"]/g, ".webp'").replace(/\.png['"]/g, ".webp'");
  if (content !== updated) {
    fs.writeFileSync(file, updated);
    console.log('Updated ' + file);
  }
}
