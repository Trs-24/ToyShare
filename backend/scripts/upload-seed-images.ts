import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { readdirSync } from 'fs';
import { join } from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR =
  '/Users/Taras/.gemini/antigravity/brain/f902bfbf-555d-4c42-8396-24573bacada1';

async function uploadImages() {
  const files = readdirSync(IMAGES_DIR).filter(
    (f) => f.endsWith('.png') && f.startsWith('toy_'),
  );
  const results: Record<string, string> = {};

  console.log(`🚀 Found ${files.length} images to upload.`);

  for (const file of files) {
    const filePath = join(IMAGES_DIR, file);
    const category = file.split('_')[1]; // toy_lego_set... -> lego

    console.log(`📤 Uploading ${file}...`);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'toyshare_seed',
      });
      results[category] = result.secure_url;
      console.log(`✅ Uploaded ${category}: ${result.secure_url}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${file}:`, error);
    }
  }

  console.log('\n--- UPLOAD RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
}

uploadImages();
