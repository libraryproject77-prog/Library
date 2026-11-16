import fs from 'fs';
import path from 'path';
const { PDFParse } = require('pdf-parse');

interface RawItem {
  source: string;
  sNo: number;
  accNo: string;
  author: string;
  title: string;
  publisher: string;
}

// Map subject titles to proper ECE categories
function categorizeBook(title: string): { categoryId: string; categoryName: string; rack: string } {
  const t = title.toLowerCase();
  
  if (t.includes('vlsi') || t.includes('cmos') || t.includes('vhdl') || t.includes('asic') || t.includes('fpga') || t.includes('embedded') || t.includes('real time') || t.includes('realtime')) {
    return { categoryId: 'cat-vlsi', categoryName: 'VLSI Design & Embedded Systems', rack: 'Rack ECE-01, Shelf A' };
  }
  if (t.includes('image processing') || t.includes('dip') || t.includes('signal processing') || t.includes('dsp') || t.includes('discrete-time') || t.includes('discrete time') || t.includes('filter design')) {
    return { categoryId: 'cat-dsp', categoryName: 'Digital Signal & Image Processing', rack: 'Rack ECE-02, Shelf B' };
  }
  if (t.includes('signals & systems') || t.includes('signal and system') || t.includes('signals and system') || t.includes('control system')) {
    return { categoryId: 'cat-ss', categoryName: 'Signals, Systems & Control Engineering', rack: 'Rack ECE-02, Shelf C' };
  }
  if (t.includes('wireless') || t.includes('optical') || t.includes('satellite') || t.includes('microwave') || t.includes('antenna') || t.includes('rf &') || t.includes('rf and') || t.includes('awp') || t.includes('communication') || t.includes('network') || t.includes('switching')) {
    return { categoryId: 'cat-comm', categoryName: 'Communication Networks, RF & Optical', rack: 'Rack ECE-03, Shelf A' };
  }
  if (t.includes('transmission line') || t.includes('waveguide') || t.includes('electromagnetic') || t.includes('emf') || t.includes('electro magnetic') || t.includes('fields')) {
    return { categoryId: 'cat-emft', categoryName: 'Electromagnetics & Transmission Lines', rack: 'Rack ECE-03, Shelf C' };
  }
  if (t.includes('circuit') || t.includes('electron device') || t.includes('electronic device') || t.includes('integrated circuit') || t.includes('lic') || t.includes('opamp') || t.includes('op-amp') || t.includes('measurements') || t.includes('instrumentation') || t.includes('basic electronics')) {
    return { categoryId: 'cat-circuits', categoryName: 'Circuits, Devices & Linear ICs', rack: 'Rack ECE-04, Shelf A' };
  }
  if (t.includes('microprocessor') || t.includes('microcontroller') || t.includes('architecture') || t.includes('programming') || t.includes('data structure') || t.includes('operating system') || t.includes('computer')) {
    return { categoryId: 'cat-mpmc', categoryName: 'Microprocessors, Architecture & Computing', rack: 'Rack ECE-04, Shelf B' };
  }
  return { categoryId: 'cat-mgmt', categoryName: 'Management, Humanities & Sciences', rack: 'Rack ECE-05, Shelf A' };
}

async function extractFromDb1(): Promise<RawItem[]> {
  const p = new PDFParse({ data: fs.readFileSync('C:\\Users\\santh\\Downloads\\Dept_Lib_DB1.pdf') });
  await p.load();
  const textObj = await p.getText();

  const allText = textObj.pages.map((page: any) => page.text).join('\n');
  const lines = allText.split('\n');

  const items: RawItem[] = [];
  let current: { sNo: number; lines: string[] } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('S.NO') || line.includes('ACC No AUTHOR')) continue;

    // Check for row start: "1 \t" or "3881 \t" or "23 ECESC"
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match && parseInt(match[1]) > 0 && parseInt(match[1]) <= 4000) {
      if (current) {
        items.push(processDb1Block(current.sNo, current.lines));
      }
      current = {
        sNo: parseInt(match[1]) === 3881 ? 381 : parseInt(match[1]),
        lines: [match[2]]
      };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) items.push(processDb1Block(current.sNo, current.lines));

  return items;
}

function processDb1Block(sNo: number, rawLines: string[]): RawItem {
  const fullText = rawLines.join(' ');
  // Extract Acc No at the beginning e.g. "ECESC216", "ECESC 348", "ECE1696", etc.
  const accMatch = fullText.match(/^([A-Z]{3,6}\s*[0-9]+[A-Z]?|[0-9]{4,6}|[A-Z0-9\/-]+)\s*(.*)$/i);
  let accNo = `ECESC${String(sNo).padStart(3, '0')}`;
  let rest = fullText;

  if (accMatch) {
    accNo = accMatch[1].replace(/\s+/g, '');
    rest = accMatch[2];
  }

  // Try splitting by tab if present
  let author = '';
  let title = '';
  let publisher = '';

  const tabParts = rest.split('\t').map(s => s.trim()).filter(Boolean);
  if (tabParts.length >= 3) {
    author = tabParts[0];
    title = tabParts[1];
    publisher = tabParts.slice(2).join(' ');
  } else if (tabParts.length === 2) {
    author = tabParts[0];
    title = tabParts[1];
    publisher = 'Department Library';
  } else {
    // Split heuristically
    const parts = rest.split(/\s{2,}/);
    if (parts.length >= 3) {
      author = parts[0];
      title = parts[1];
      publisher = parts.slice(2).join(' ');
    } else if (parts.length === 2) {
      author = parts[0];
      title = parts[1];
      publisher = 'Department Library';
    } else {
      title = rest;
      author = 'Faculty Reference';
      publisher = 'Academic Publication';
    }
  }

  return {
    source: 'DB1',
    sNo,
    accNo,
    author: author || 'ECE Faculty / Author',
    title: title || 'ECE Technical Reference',
    publisher: publisher || 'Lakshmi Publications'
  };
}

async function run() {
  console.log('Extracting from Dept_Lib_DB1.pdf...');
  const db1Items = await extractFromDb1();
  console.log(`Extracted ${db1Items.length} items from DB1.`);

  // Clean titles & authors
  const cleanedItems = db1Items.map(item => {
    let title = item.title.replace(/\s+/g, ' ').trim();
    let author = item.author.replace(/\s+/g, ' ').trim();
    let publisher = item.publisher.replace(/\s+/g, ' ').trim();

    // Remove any trailing or leading unwanted chars
    if (title.endsWith('Scitech Publications') || title.endsWith('Lakshmi Publications')) {
      title = title.replace(/(Scitech|Lakshmi|Anuradha|Pearson|Tata McGraw Hill).*/i, '').trim();
    }

    return {
      ...item,
      title,
      author,
      publisher
    };
  });

  // Save parsed items to JSON
  fs.writeFileSync(
    path.resolve(__dirname, 'dept_library_catalog.json'),
    JSON.stringify(cleanedItems, null, 2),
    'utf-8'
  );

  console.log('Saved dept_library_catalog.json successfully.');
  console.log('Sample item 1:', cleanedItems[0]);
  console.log('Sample item 10:', cleanedItems[9]);
  console.log('Sample item 100:', cleanedItems[99]);
}

run().catch(console.error);
