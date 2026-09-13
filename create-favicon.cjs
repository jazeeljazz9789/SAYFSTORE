const { Jimp } = require('jimp');

async function createFavicon() {
  try {
    const image = await Jimp.read('public/sayf-logo.png');
    
    // Autocrop might remove transparent space, but just in case, we'll get the height
    // wait, Jimp v1 has `image.autocrop()`? Let's just resize it directly or crop manually.
    const h = image.bitmap.height;
    
    // The "S" is likely on the left side. Let's crop a square from the left edge.
    // If it's a wordmark, we'll crop a square of size 'h' starting at x=0
    image.crop({ x: 0, y: 0, w: h, h: h });
    
    image.resize({ w: 512, h: 512 });
    
    await image.write('public/sayf-favicon.png');
    console.log('Favicon created successfully. Dimensions: 512x512');
  } catch (err) {
    console.error('Error creating favicon:', err);
  }
}

createFavicon();
