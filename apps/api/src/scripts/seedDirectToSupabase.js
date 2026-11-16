const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://cjwykoevlivvilciuctl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QpPQwzew8G5My7O-cgeNSw_5YSiQiH6';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedDirectly() {
  console.log('🚀 Connecting to Supabase at:', SUPABASE_URL);

  const datasetPath = path.resolve(__dirname, '../../../web/data/dept_library_dataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  const categories = dataset.categories;
  const books = dataset.books;
  
  // Collect all copies
  const allCopies = [];
  for (const b of books) {
    if (b.copies && Array.isArray(b.copies)) {
      for (const c of b.copies) {
        allCopies.push({
          id: c.id,
          bookId: b.id,
          copyNumber: c.copyNumber,
          status: c.status || 'AVAILABLE',
          conditionNotes: c.conditionNotes || 'Physical volume in Department Library',
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
        });
      }
    }
  }

  console.log(`📦 Found: ${categories.length} Categories, ${books.length} Books, ${allCopies.length} Physical Copies.`);

  // 1. Seed Categories
  console.log('\n--- 1. Seeding Categories ---');
  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      name: cat.name,
      code: cat.code,
      description: cat.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { onConflict: 'code' });

    if (error) {
      console.warn(`⚠️ Error upserting category ${cat.name}:`, error.message);
    } else {
      console.log(`  ✓ Category: ${cat.name} (${cat.code})`);
    }
  }

  // 2. Seed Books in Batches of 50
  console.log('\n--- 2. Seeding 581 Books in Batches ---');
  const BATCH_SIZE = 50;
  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const slice = books.slice(i, i + BATCH_SIZE).map(b => ({
      id: b.id,
      isbn: b.isbn,
      title: b.title,
      author: b.author,
      publisher: b.publisher || 'FXEC Academic Publications',
      edition: b.edition || 'Academic Edition',
      coverImage: b.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
      description: b.description || 'Official FXEC ECE Department Library volume.',
      rackLocation: b.rackLocation || 'Rack ECE-01, Shelf A',
      categoryId: b.categoryId,
      createdAt: b.createdAt || new Date().toISOString(),
      updatedAt: b.updatedAt || new Date().toISOString(),
    }));

    const { error } = await supabase.from('books').upsert(slice, { onConflict: 'isbn' });
    if (error) {
      console.warn(`⚠️ Error inserting books batch [${i} - ${i + slice.length}]:`, error.message);
    } else {
      console.log(`  ✓ Inserted books ${i + 1} to ${Math.min(i + BATCH_SIZE, books.length)} of ${books.length}`);
    }
  }

  // 3. Seed Copies in Batches of 50
  console.log('\n--- 3. Seeding 653 Book Copies in Batches ---');
  for (let i = 0; i < allCopies.length; i += BATCH_SIZE) {
    const slice = allCopies.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('book_copies').upsert(slice, { onConflict: 'copyNumber' });
    if (error) {
      console.warn(`⚠️ Error inserting copies batch [${i} - ${i + slice.length}]:`, error.message);
    } else {
      console.log(`  ✓ Inserted copies ${i + 1} to ${Math.min(i + BATCH_SIZE, allCopies.length)} of ${allCopies.length}`);
    }
  }

  // 4. Verification Count
  console.log('\n--- 4. Verifying Supabase Row Counts ---');
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: bookCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
  const { count: copyCount } = await supabase.from('book_copies').select('*', { count: 'exact', head: true });

  console.log(`\n🎉 FINAL RESULTS IN SUPABASE:`);
  console.log(`   📚 Categories:     ${catCount}`);
  console.log(`   📖 Books:          ${bookCount} of 581`);
  console.log(`   🏷️  Physical Copies: ${copyCount} of 653`);
}

seedDirectly().catch(console.error);
