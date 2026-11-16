import { prisma } from '../config/prisma';
import fs from 'fs';
import path from 'path';

async function seedSupabase() {
  if (!prisma) {
    console.error('Prisma client not connected. Please ensure DATABASE_URL in .env points to your Supabase PostgreSQL database.');
    return;
  }

  console.log('Connecting to Supabase PostgreSQL database...');
  const datasetPath = path.resolve(__dirname, '../data/dept_library_dataset.json');
  const data = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

  console.log(`Seeding ${data.categories.length} categories...`);
  for (const cat of data.categories) {
    await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description },
      create: { id: cat.id, name: cat.name, code: cat.code, description: cat.description }
    });
  }

  console.log(`Seeding ${data.books.length} department books...`);
  for (const b of data.books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {
        title: b.title,
        author: b.author,
        publisher: b.publisher,
        rackLocation: b.rackLocation,
        categoryId: b.categoryId
      },
      create: {
        id: b.id,
        isbn: b.isbn,
        title: b.title,
        author: b.author,
        publisher: b.publisher,
        edition: b.edition,
        coverImage: b.coverImage,
        description: b.description,
        rackLocation: b.rackLocation,
        categoryId: b.categoryId
      }
    });

    if (b.copies) {
      for (const copy of b.copies) {
        await prisma.bookCopy.upsert({
          where: { copyNumber: copy.copyNumber },
          update: { status: copy.status, conditionNotes: copy.conditionNotes },
          create: {
            id: copy.id,
            bookId: b.id,
            copyNumber: copy.copyNumber,
            status: copy.status,
            conditionNotes: copy.conditionNotes
          }
        });
      }
    }
  }

  console.log('✅ Supabase PostgreSQL seeding complete! All department library books and copies are live.');
}

seedSupabase().catch(console.error);
