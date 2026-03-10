import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ypukupbmfqjmddikjuyp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdWt1cGJtZnFqbWRkaWtqdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA0Nzc5OCwiZXhwIjoyMDg4NjIzNzk4fQ.-WaBSqfTF4eQwGG0lOG_rJoCBk3yvC2BgbVJCk3mx7g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDataDeeply() {
  const { data: dbProducts, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Error fetching from Supabase:', error);
    return;
  }
  
  let issueCount = 0;
  for (const dbProduct of dbProducts) {
      const data = dbProduct.data || {};
      
      // Specifically looking for the things that crashed in the logs previously:
      // item.name, item.kataban, item.highlights
      
      if (!dbProduct.name || !data.kataban || !data.highlights) {
          issueCount++;
          console.log(`Issue with Product ID ${dbProduct.id}`);
          console.log(`name: ${dbProduct.name}, data.kataban: ${data.kataban}, data.highlights: ${data.highlights}`);
      }
  }

  console.log(`Found ${issueCount} products with missing core properties inside data JSONb.`);
}

checkDataDeeply();
