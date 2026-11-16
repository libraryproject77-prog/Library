import fs from 'fs';
const { PDFParse } = require('pdf-parse');

interface RawBookRow {
  sNo: number;
  accNo: string;
  author: string;
  title: string;
  publisher: string;
}

async function extractRows() {
  const p = new PDFParse({ data: fs.readFileSync('C:\\Users\\santh\\Downloads\\Dept_Lib_DB1.pdf') });
  await p.load();
  const textObj = await p.getText();

  const allText = textObj.pages.map((page: any) => page.text).join('\n');
  const lines = allText.split('\n');

  console.log('Total raw lines in DB1:', lines.length);

  // Let's inspect rows starting with number
  const rows: any[] = [];
  let current: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('S.NO') || line.includes('ACC No AUTHOR')) continue;

    // Check if line starts with row number e.g. "1 \t" or "1 ECESC" or "24 \t"
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match && parseInt(match[1]) > 0 && parseInt(match[1]) <= 700) {
      if (current) {
        rows.push(current);
      }
      current = {
        sNo: parseInt(match[1]),
        rawText: match[2]
      };
    } else if (current) {
      current.rawText += ' ' + line;
    }
  }
  if (current) rows.push(current);

  console.log('Total parsed rows in DB1:', rows.length);
  console.log('First 5 rows:', JSON.stringify(rows.slice(0, 5), null, 2));
  console.log('Last 5 rows:', JSON.stringify(rows.slice(-5), null, 2));
}

extractRows().catch(console.error);
