import fs from 'fs';
import path from 'path';

function run() {
  const transcriptPath = 'C:\\Users\\santh\\.gemini\\antigravity\\brain\\54927b5a-956b-4410-b249-38b2d831d109\\.system_generated\\logs\\transcript_full.jsonl';
  const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

  let ocrContent = '';
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.content && obj.content.includes('==Start of OCR for page 1==')) {
        ocrContent = obj.content;
        break;
      }
    } catch (e) {
      // ignore
    }
  }

  console.log('Found OCR content, length:', ocrContent.length);
  fs.writeFileSync(path.resolve(__dirname, 'ocr_raw.txt'), ocrContent, 'utf-8');
}

run();
