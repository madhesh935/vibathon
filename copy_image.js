const fs = require('fs');
const src = 'C:\\Users\\madhesh\\.gemini\\antigravity-ide\\brain\\de996f67-ddd4-4d67-8fbb-addcbcad5611\\blue_alien_avatar_1782032378050.png';
const dest = 'c:\\Users\\madhesh\\OneDrive\\Desktop\\qvac\\frontend\\public\\stitch.png';
fs.copyFileSync(src, dest);
console.log('Copied successfully!');
