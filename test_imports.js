import parser from 'stream-json/parser.js';
import { Readable } from 'stream';

const json = JSON.stringify({
  directoryStructure: 'test',
  files: { 'a.ts': 'content' }
});

const p = parser.asStream();
const inputStream = Readable.from([json]);

p.on('data', (data) => {
  console.log('Token:', data);
});

p.on('end', () => {
  console.log('End');
});

inputStream.pipe(p);
