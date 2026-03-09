const fs = require('fs');
const path = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\ba4ae711-0795-4a97-9a9a-62e32568c6fc\\.system_generated\\logs\\overview.txt';
try {
  const text = fs.readFileSync(path, 'utf8');
  const match = text.match(/\{"nm":"Food Animation".*?\}/g);
  if (match) {
    const jsonStr = match[match.length - 1]; // get the latest
    fs.writeFileSync('C:\\Users\\USER\\Downloads\\Wedding QR Event App\\src\\assets\\food-animation.json', jsonStr, 'utf8');
    console.log('Saved JSON');
  } else {
    console.log('JSON not found');
  }
} catch(e) { console.error(e); }
