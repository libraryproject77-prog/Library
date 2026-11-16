import fs from 'fs';
import path from 'path';
const { PDFParse } = require('pdf-parse');

interface RawRow {
  sNo: number;
  accNo: string;
  author: string;
  title: string;
  publisher: string;
}

// Map subject titles to proper ECE categories
function categorizeBook(title: string): { categoryId: string; categoryName: string; rack: string; code: string } {
  const t = title.toLowerCase();
  
  if (t.includes('vlsi') || t.includes('cmos') || t.includes('vhdl') || t.includes('asic') || t.includes('fpga') || t.includes('embedded') || t.includes('real time') || t.includes('realtime') || t.includes('ic design')) {
    return { categoryId: 'cat-vlsi', categoryName: 'VLSI Design & Embedded Systems', rack: 'Rack ECE-01, Shelf A', code: 'VLSI' };
  }
  if (t.includes('image processing') || t.includes('dip') || t.includes('signal processing') || t.includes('dsp') || t.includes('discrete-time') || t.includes('discrete time') || t.includes('filter design') || t.includes('wavelet')) {
    return { categoryId: 'cat-dsp', categoryName: 'Digital Signal & Image Processing', rack: 'Rack ECE-02, Shelf B', code: 'DSP' };
  }
  if (t.includes('signals & systems') || t.includes('signal and system') || t.includes('signals and system') || t.includes('signals & system') || t.includes('control system') || t.includes('automatic control') || t.includes('matlab')) {
    return { categoryId: 'cat-ss', categoryName: 'Signals, Systems & Control Engineering', rack: 'Rack ECE-02, Shelf C', code: 'CTRL' };
  }
  if (t.includes('wireless') || t.includes('optical') || t.includes('satellite') || t.includes('microwave') || t.includes('antenna') || t.includes('rf &') || t.includes('rf and') || t.includes('awp') || t.includes('communication') || t.includes('network') || t.includes('telecommunication') || t.includes('cognitive radio')) {
    return { categoryId: 'cat-comm', categoryName: 'Communication Networks, RF & Optical', rack: 'Rack ECE-03, Shelf A', code: 'COMM' };
  }
  if (t.includes('transmission line') || t.includes('waveguide') || t.includes('electromagnetic') || t.includes('emf') || t.includes('electro magnetic') || t.includes('fields') || t.includes('compatibility') || t.includes('emi') || t.includes('emc')) {
    return { categoryId: 'cat-emft', categoryName: 'Electromagnetics & Transmission Lines', rack: 'Rack ECE-03, Shelf C', code: 'EMFT' };
  }
  if (t.includes('circuit') || t.includes('electron device') || t.includes('electronic device') || t.includes('integrated circuit') || t.includes('lic') || t.includes('opamp') || t.includes('op-amp') || t.includes('measurements') || t.includes('instrumentation') || t.includes('basic electronics') || t.includes('pulse')) {
    return { categoryId: 'cat-circuits', categoryName: 'Circuits, Devices & Linear ICs', rack: 'Rack ECE-04, Shelf A', code: 'CIRC' };
  }
  if (t.includes('microprocessor') || t.includes('microcontroller') || t.includes('architecture') || t.includes('programming') || t.includes('data structure') || t.includes('operating system') || t.includes('computer') || t.includes('soft computing') || t.includes('cyber') || t.includes('forensics')) {
    return { categoryId: 'cat-mpmc', categoryName: 'Microprocessors, Architecture & Computing', rack: 'Rack ECE-04, Shelf B', code: 'COMP' };
  }
  return { categoryId: 'cat-mgmt', categoryName: 'Management, Humanities & Sciences', rack: 'Rack ECE-05, Shelf A', code: 'MGMT' };
}

async function extractAllDb1(): Promise<RawRow[]> {
  const p = new PDFParse({ data: fs.readFileSync('C:\\Users\\santh\\Downloads\\Dept_Lib_DB1.pdf') });
  await p.load();

  const totalPages = p.doc.numPages;
  const rows: RawRow[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await p.doc.getPage(pageNum);
    const tc = await page.getTextContent();

    // Items with coordinates
    const items = tc.items
      .filter((it: any) => it.str && it.str.trim() !== '')
      .map((it: any) => ({
        str: it.str.trim(),
        x: Math.round(it.transform[4]),
        y: Math.round(it.transform[5])
      }))
      .filter((it: any) => it.y < 725); // Exclude header

    // Find row starts: number in S.NO column (x <= 110)
    const rowStarts: { sNo: number; y: number }[] = [];
    for (const it of items) {
      if (it.x <= 110 && /^\d+$/.test(it.str)) {
        rowStarts.push({
          sNo: parseInt(it.str, 10),
          y: it.y
        });
      }
    }

    // Sort descending by y (top to bottom of page)
    rowStarts.sort((a, b) => b.y - a.y);

    for (let i = 0; i < rowStarts.length; i++) {
      const current = rowStarts[i];
      const prevY = (i > 0) ? rowStarts[i - 1].y : 750;
      const nextY = (i + 1 < rowStarts.length) ? rowStarts[i + 1].y : -100;

      // Vertical band for this row:
      // Text can be slightly above current.y up to (prevY + current.y)/2 and down to (current.y + nextY)/2
      const topBound = (prevY + current.y) / 2;
      const bottomBound = (current.y + nextY) / 2;

      const rowItems = items.filter((it: any) => it.y <= topBound && it.y > bottomBound);

      const accParts: string[] = [];
      const authorParts: string[] = [];
      const titleParts: string[] = [];
      const pubParts: string[] = [];

      for (const it of rowItems) {
        if (it.x <= 110) {
          // S.NO
        } else if (it.x < 178) {
          accParts.push(it.str);
        } else if (it.x < 305) {
          authorParts.push(it.str);
        } else if (it.x < 450) {
          titleParts.push(it.str);
        } else {
          pubParts.push(it.str);
        }
      }

      let acc = accParts.join(' ').trim();
      let author = authorParts.join(' ').trim();
      let title = titleParts.join(' ').trim();
      let pub = pubParts.join(' ').trim();

      // Clean up common OCR artifacts
      if (!acc) acc = `ECESC${String(current.sNo).padStart(3, '0')}`;
      if (!author) author = 'Department Faculty Reference';
      if (!title) title = 'Electronics and Communication Engineering Reference';
      if (!pub) pub = 'Department Library';

      rows.push({
        sNo: current.sNo,
        accNo: acc,
        author,
        title,
        publisher: pub
      });
    }
  }

  return rows;
}

async function run() {
  console.log('Extracting department library accession records from PDF 1...');
  const rows = await extractAllDb1();
  console.log(`Total extracted rows: ${rows.length}`);

  // Now, let's group rows into unique Book Titles & Copies
  // Multiple physical copies of the same title will be grouped under one Book,
  // each holding its individual physical accession numbers as BookCopy!
  const bookMap = new Map<string, {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    category: ReturnType<typeof categorizeBook>;
    copies: { accNo: string; sNo: number }[];
  }>();

  for (const row of rows) {
    // Normalization key for title + author
    const cleanTitle = row.title
      .replace(/\s+/g, ' ')
      .replace(/[—\-_]+/g, ' ')
      .trim();

    const cleanAuthor = row.author
      .replace(/\s+/g, ' ')
      .trim();

    const normKey = `${cleanTitle.toLowerCase()}::${cleanAuthor.toLowerCase()}`;

    if (!bookMap.has(normKey)) {
      const cat = categorizeBook(cleanTitle);
      const fakeIsbn = `978-81-${String(row.sNo).padStart(4, '0')}-${String(Math.abs(row.accNo.charCodeAt(0) * 11) % 90 + 10)}`;

      bookMap.set(normKey, {
        isbn: fakeIsbn,
        title: cleanTitle,
        author: cleanAuthor,
        publisher: row.publisher,
        category: cat,
        copies: []
      });
    }

    bookMap.get(normKey)!.copies.push({
      accNo: row.accNo,
      sNo: row.sNo
    });
  }

  console.log(`Distinct Book Titles: ${bookMap.size}`);
  console.log(`Total Physical Copies: ${rows.length}`);

  // Format into application Book and BookCopy models
  let bIdx = 1;
  const categoriesMap = new Map<string, { id: string; name: string; code: string; description: string }>();

  const finalBooks: any[] = [];
  const finalCopies: any[] = [];

  for (const [_, entry] of bookMap.entries()) {
    const bookId = `bk-ece-${bIdx++}`;
    const cat = entry.category;

    if (!categoriesMap.has(cat.categoryId)) {
      categoriesMap.set(cat.categoryId, {
        id: cat.categoryId,
        name: cat.categoryName,
        code: cat.code,
        description: `Department library standard references and textbooks for ${cat.categoryName}.`
      });
    }

    const bookCopies: any[] = [];

    entry.copies.forEach((c, cIdx) => {
      const copyId = `cp-${bookId}-${cIdx + 1}`;
      // Stagger some statuses for realistic library demonstration
      let status = 'AVAILABLE';
      if (cIdx === 1 && entry.copies.length > 3) status = 'BORROWED';
      else if (cIdx === 2 && entry.copies.length > 5) status = 'RESERVED';

      const copyObj = {
        id: copyId,
        bookId,
        copyNumber: c.accNo, // e.g. ECESC216
        status,
        conditionNotes: 'Physical volume in Department Library',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      bookCopies.push(copyObj);
      finalCopies.push(copyObj);
    });

    const availableCopies = bookCopies.filter(c => c.status === 'AVAILABLE').length;
    const reservedCopies = bookCopies.filter(c => c.status === 'RESERVED').length;
    const borrowedCopies = bookCopies.filter(c => c.status === 'BORROWED').length;

    // Standard cover image based on category
    let cover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';
    if (cat.code === 'VLSI') cover = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80';
    else if (cat.code === 'DSP') cover = 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80';
    else if (cat.code === 'COMM') cover = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80';
    else if (cat.code === 'CIRC') cover = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80';
    else if (cat.code === 'EMFT') cover = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80';
    else if (cat.code === 'COMP') cover = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&auto=format&fit=crop&q=80';

    const bookObj = {
      id: bookId,
      isbn: entry.isbn,
      title: entry.title,
      author: entry.author,
      publisher: entry.publisher,
      edition: 'Academic Edition',
      categoryId: cat.categoryId,
      category: categoriesMap.get(cat.categoryId),
      coverImage: cover,
      description: `Official FXEC ECE Department Library volume. Published by ${entry.publisher}.`,
      totalCopies: entry.copies.length,
      availableCopies,
      reservedCopies,
      borrowedCopies,
      rackLocation: cat.rack,
      copies: bookCopies,
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date().toISOString()
    };

    finalBooks.push(bookObj);
  }

  const finalCategories = Array.from(categoriesMap.values());

  // Save JSON
  const outputData = {
    categories: finalCategories,
    books: finalBooks,
    copiesCount: finalCopies.length
  };

  const outputPath = path.resolve(__dirname, '../data/dept_library_dataset.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

  console.log(`Saved ${finalBooks.length} distinct titles and ${finalCopies.length} physical copies to ${outputPath}`);

  // Generate Supabase SQL seed file
  generateSupabaseSQL(finalCategories, finalBooks, finalCopies);
}

function generateSupabaseSQL(categories: any[], books: any[], copies: any[]) {
  const sqlLines: string[] = [
    '-- ========================================================',
    '-- FXEC ECE DEPARTMENT LIBRARY - SUPABASE DATABASE SEED',
    '-- Generated from official Accession Register (Dept_Lib_DB1.pdf)',
    '-- ========================================================',
    '',
    '-- 1. Insert Categories',
  ];

  for (const cat of categories) {
    const desc = (cat.description || '').replace(/'/g, "''");
    sqlLines.push(
      `INSERT INTO "categories" ("id", "name", "code", "description", "createdAt", "updatedAt") ` +
      `VALUES ('${cat.id}', '${cat.name.replace(/'/g, "''")}', '${cat.code}', '${desc}', NOW(), NOW()) ` +
      `ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";`
    );
  }

  sqlLines.push('', '-- 2. Insert Books');
  for (const b of books) {
    const title = b.title.replace(/'/g, "''");
    const author = b.author.replace(/'/g, "''");
    const pub = (b.publisher || '').replace(/'/g, "''");
    const desc = (b.description || '').replace(/'/g, "''");
    const rack = b.rackLocation.replace(/'/g, "''");

    sqlLines.push(
      `INSERT INTO "books" ("id", "isbn", "title", "author", "publisher", "edition", "coverImage", "description", "rackLocation", "categoryId", "createdAt", "updatedAt") ` +
      `VALUES ('${b.id}', '${b.isbn}', '${title}', '${author}', '${pub}', 'Academic Edition', '${b.coverImage}', '${desc}', '${rack}', '${b.categoryId}', NOW(), NOW()) ` +
      `ON CONFLICT ("isbn") DO NOTHING;`
    );
  }

  sqlLines.push('', '-- 3. Insert Physical Copies with unique ACC Numbers');
  for (const c of copies) {
    sqlLines.push(
      `INSERT INTO "book_copies" ("id", "bookId", "copyNumber", "status", "conditionNotes", "createdAt", "updatedAt") ` +
      `VALUES ('${c.id}', '${c.bookId}', '${c.copyNumber}', '${c.status}', '${(c.conditionNotes || '').replace(/'/g, "''")}', NOW(), NOW()) ` +
      `ON CONFLICT ("copyNumber") DO NOTHING;`
    );
  }

  const sqlPath = path.resolve(__dirname, '../../prisma/seed_supabase.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n'), 'utf-8');
  console.log(`Generated Supabase SQL seed file: ${sqlPath} (${(fs.statSync(sqlPath).size / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
