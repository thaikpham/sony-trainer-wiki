import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://ypukupbmfqjmddikjuyp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdWt1cGJtZnFqbWRkaWtqdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA0Nzc5OCwiZXhwIjoyMDg4NjIzNzk4fQ.-WaBSqfTF4eQwGG0lOG_rJoCBk3yvC2BgbVJCk3mx7g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function recoverData() {
  console.log('--- STARTING RECOVERY ---');
  
  // 1. Load original data from JSON
  console.log('Loading importData.json...');
  const rawData = fs.readFileSync('./public/importData.json', 'utf8');
  const importData = JSON.parse(rawData);
  console.log(`Loaded ${importData.length} original products.`);

  // 2. Fetch all products from Supabase
  console.log('Fetching products from Supabase...');
  const { data: dbProducts, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Error fetching from Supabase:', error);
    return;
  }
  
  console.log(`Found ${dbProducts.length} products in DB.`);

  // 3. Find broken products and recover them
  let recoveredCount = 0;
  
  for (const dbProduct of dbProducts) {
    // Unconditionally update all records
    const kataban = dbProduct.data?.kataban || dbProduct.kataban; // Handle varying schema structures just in case
      
    if (kataban) {
      const originalProduct = importData.find(p => p.kataban === kataban);
        
      if (originalProduct) {
        console.log(`Recovering: Kataban ${kataban} -> Name: ${originalProduct.name}, Category: ${originalProduct.category}`);
          
        // Safely map missing JSONB data properties as well
        const updatedData = {
          ...(dbProduct.data || {}),
          name: originalProduct.name,
          category: originalProduct.category,
          kataban: originalProduct.kataban
        };
        // Restore highlights if missing
        if (!updatedData.highlights && originalProduct.highlights !== undefined) updatedData.highlights = originalProduct.highlights;

        // Update the database
        const { error: updateError } = await supabase.from('products')
          .update({
            name: originalProduct.name,
            category: originalProduct.category,
            data: updatedData
          })
          .eq('id', dbProduct.id);
            
        if (updateError) {
           console.error(`Failed to recover ${kataban}:`, updateError);
        } else {
           recoveredCount++;
        }
      } else {
        console.warn(`Could not find original data for kataban: ${kataban}`);
      }
    } else {
       console.warn(`Broken product with ID ${dbProduct.id} has no kataban to match against.`);
    }
  }
  
  console.log('--- RECOVERY COMPLETE ---');
  console.log(`Total products recovered: ${recoveredCount}`);
}

recoverData();
