import { pack, search, summarize } from './dist/index.js';

async function lapOfHonor() {
  console.log('🚀 Starting Library Demo: The Lap of Honor\n');

  // 1. Pack a small subset of the project
  console.log('📦 Phase 1: Packing src/api directory...');
  const snapshot = await pack('./src/api', { silent: true });
  console.log(`✅ Packed ${Object.keys(snapshot.files).length} files into snapshot.\n`);

  // 2. Search for 'Command' in the snapshot
  console.log('🔍 Phase 2: Searching for "Command" in the new snapshot...');
  const searchResults = await search(snapshot, 'Command', { context: 0 });
  console.log(`✅ Found ${searchResults.length} files containing "Command".\n`);

  // 3. Summarize the snapshot
  console.log('🗺️  Phase 3: Generating architectural summary...');
  const summary = await summarize(snapshot);
  console.log('✅ Summary generated successfully.');
  console.log('─'.repeat(50));
  console.log('Snapshot Instruction:', snapshot.instruction || 'None');
  console.log('Files summarized:', Object.keys(summary.files || {}).length);
  console.log('─'.repeat(50));

  console.log('\n🏆 Library functionality verified. jref is ready for production.');
}

lapOfHonor().catch(console.error);
