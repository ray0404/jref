import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

const testDir = './test_repomix';

// Create test directory
if (!existsSync(testDir)) {
  execSync(`mkdir -p ${testDir}`);
  execSync(`echo "console.log('hello');" > ${testDir}/main.ts`);
  execSync(`echo '{"name": "test"}' > ${testDir}/package.json`);
}

// Test current jref pack output
console.log('Testing current jref pack output:');
const jrefOutput = execSync(`node ./dist/index.js pack ${testDir} --json`, { encoding: 'utf8' });
console.log(jrefOutput);

// Parse it to see the structure
const jrefParsed = JSON.parse(jrefOutput);
console.log('\nCurrent jref structure:');
console.log('directoryStructure:', JSON.stringify(jrefParsed.directoryStructure));
console.log('files:', Object.keys(jrefParsed.files));
console.log('instruction:', jrefParsed.instruction);
console.log('fileSummary:', jrefParsed.fileSummary);

// Test repomix output
console.log('\n\nTesting repomix output:');
const repomixOutput = execSync(`node ./node_modules/repomix/bin/repomix.cjs --style json --stdout ${testDir}`, { encoding: 'utf8' });
console.log(repomixOutput);

// Parse it to see the structure
const repomixParsed = JSON.parse(repomixOutput);
console.log('\nRepomix structure:');
console.log('directoryStructure:', JSON.stringify(repomixParsed.directoryStructure));
console.log('files:', Object.keys(repomixParsed.files));