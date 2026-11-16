import fs from 'fs';
import path from 'path';

function run() {
  const transcriptPath = 'C:\\Users\\santh\\.gemini\\antigravity\\brain\\54927b5a-956b-4410-b249-38b2d831d109\\.system_generated\\logs\\transcript_full.jsonl';
  const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

  console.log('Extracting line 281 and 285...');
  const obj1 = JSON.parse(lines[281]);
  const obj2 = JSON.parse(lines[285]);

  const text1 = JSON.stringify(obj1);
  const text2 = JSON.stringify(obj2);

  fs.writeFileSync(path.resolve(__dirname, 'pdf1_ocr.txt'), text1, 'utf-8');
  fs.writeFileSync(path.resolve(__dirname, 'pdf2_ocr.txt'), text2, 'utf-8');

  console.log('Saved pdf1_ocr.txt (length: ' + text1.length + ') and pdf2_ocr.txt (length: ' + text2.length + ')');
}

run();
