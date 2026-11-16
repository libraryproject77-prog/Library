import fs from 'fs';
import path from 'path';
const pdf = require('pdf-parse');

async function parsePdf(filePath: string) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function run() {
  const file1 = 'C:\\Users\\santh\\Downloads\\Dept_Lib_DB1.pdf';
  const file2 = 'C:\\Users\\santh\\Downloads\\Dept_Lib_DB2.pdf';

  console.log('Parsing DB1...');
  const text1 = await parsePdf(file1);
  console.log('DB1 character length:', text1.length);
  fs.writeFileSync(path.resolve(__dirname, 'db1_text.txt'), text1, 'utf-8');

  console.log('Parsing DB2...');
  const text2 = await parsePdf(file2);
  console.log('DB2 character length:', text2.length);
  fs.writeFileSync(path.resolve(__dirname, 'db2_text.txt'), text2, 'utf-8');

  console.log('Sample from DB1:');
  console.log(text1.slice(0, 500));
}

run().catch(console.error);
