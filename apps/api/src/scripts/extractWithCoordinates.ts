import fs from 'fs';
import path from 'path';
const { PDFParse } = require('pdf-parse');

interface ExtractedBookRecord {
  source: string;
  page: number;
  sNo: number;
  accNo: string;
  author: string;
  title: string;
  publisher: string;
}

async function parseDocument(pdfPath: string, sourceName: string, colThresholds: { sno: number; acc: number; author: number; title: number }): Promise<ExtractedBookRecord[]> {
  const p = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await p.load();

  const totalPages = p.doc.numPages;
  const records: ExtractedBookRecord[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await p.doc.getPage(pageNum);
    const tc = await page.getTextContent();
    
    // Sort items vertically (top to bottom: descending y), then horizontally (left to right: ascending x)
    const items = tc.items
      .filter((it: any) => it.str && it.str.trim() !== '')
      .map((it: any) => ({
        str: it.str.trim(),
        x: Math.round(it.transform[4]),
        y: Math.round(it.transform[5])
      }))
      .filter((it: any) => it.y < 725); // Exclude table header

    // Find all row starts (S.NO in the first column)
    // S.NO is integer number at x <= colThresholds.sno
    const rowStarts: { sNo: number; y: number }[] = [];
    for (const it of items) {
      if (it.x <= colThresholds.sno && /^\d+$/.test(it.str)) {
        rowStarts.push({
          sNo: parseInt(it.str, 10),
          y: it.y
        });
      }
    }

    // Sort row starts by descending y
    rowStarts.sort((a, b) => b.y - a.y);

    // Group items into rows
    for (let i = 0; i < rowStarts.length; i++) {
      const current = rowStarts[i];
      const nextY = (i + 1 < rowStarts.length) ? rowStarts[i + 1].y : -1000;

      // Items that fall between current row start and next row start
      // Give a tiny tolerance: y <= current.y + 4 and y > nextY + 4
      const rowItems = items.filter((it: any) => it.y <= current.y + 5 && it.y > nextY + 5);

      const accParts: string[] = [];
      const authorParts: string[] = [];
      const titleParts: string[] = [];
      const pubParts: string[] = [];

      for (const it of rowItems) {
        if (it.x <= colThresholds.sno) {
          // S.NO already captured
        } else if (it.x < colThresholds.acc) {
          accParts.push(it.str);
        } else if (it.x < colThresholds.author) {
          authorParts.push(it.str);
        } else if (it.x < colThresholds.title) {
          titleParts.push(it.str);
        } else {
          pubParts.push(it.str);
        }
      }

      records.push({
        source: sourceName,
        page: pageNum,
        sNo: current.sNo,
        accNo: accParts.join(' ').trim() || `ACC-${current.sNo}`,
        author: authorParts.join(' ').trim() || 'Faculty Author',
        title: titleParts.join(' ').trim() || 'Engineering Reference',
        publisher: pubParts.join(' ').trim() || 'Academic Publisher'
      });
    }
  }

  return records;
}

async function run() {
  console.log('Parsing DB1 (Dept_Lib_DB1.pdf)...');
  const db1Records = await parseDocument(
    'C:\\Users\\santh\\Downloads\\Dept_Lib_DB1.pdf',
    'DB1',
    { sno: 110, acc: 178, author: 305, title: 450 }
  );
  console.log(`DB1 extracted: ${db1Records.length} records.`);

  console.log('Parsing DB2 (Dept_Lib_DB2.pdf)...');
  const db2Records = await parseDocument(
    'C:\\Users\\santh\\Downloads\\Dept_Lib_DB2.pdf',
    'DB2',
    { sno: 88, acc: 165, author: 305, title: 450 }
  );
  console.log(`DB2 extracted: ${db2Records.length} records.`);

  console.log('First 5 from DB1:');
  console.log(db1Records.slice(0, 5));

  console.log('First 5 from DB2:');
  console.log(db2Records.slice(0, 5));

  fs.writeFileSync(
    path.resolve(__dirname, 'all_parsed_raw.json'),
    JSON.stringify({ db1: db1Records, db2: db2Records }, null, 2),
    'utf-8'
  );
}

run().catch(console.error);
