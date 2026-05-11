import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

const testDir = './test_repomix';

// Create test directory
if (!existsSync(testDir)) {
  execSync(`mkdir -p ${testDir}`);
  execSync(`echo "console.log('hello');" > ${testDir}/main.ts`);
  execSync(`echo '{"name": "test"}' > ${testDir}/package.json`);
}

// Test repomix output
console.log('Testing repomix output:');
const repomixOutput = execSync(`node ./node_modules/repomix/bin/repomix.cjs --style json --stdout ${testDir}`, { encoding: 'utf8' });
console.log(repomixOutput);

// Parse it to see the structure
const parsed = JSON.parse(repomixOutput);
console.log('\nParsed structure:');
console.log('directoryStructure:', JSON.stringify(parsed.directoryStructure));
console.log('files:', Object.keys(parsed.files));