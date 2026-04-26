import { Command } from '../utils/command.js';
import { existsSync, readFileSync, readdirSync, lstatSync } from 'fs';
import { join, relative } from 'path';
import { printTable } from '../utils/output.js';
export class DiffCommand extends Command {
    definition = {
        name: 'diff',
        description: 'Compare snapshot against local filesystem',
        usage: 'jref diff [options] [file.json]',
        options: [
            {
                flags: '--directory, -d <dir>',
                description: 'Target directory to compare against (default: current directory)'
            },
            {
                flags: '--all, -a',
                description: 'Include local files that are missing from the snapshot'
            }
        ],
        examples: [
            'jref diff snapshot.json',
            'jref diff --directory ./another-project snapshot.json',
            'jref diff --all snapshot.json'
        ],
        workflows: [
            'Integrity Check: Verify if the local project files match exactly what is in the snapshot.',
            'Change Detection: Identify modifications made to local files since the snapshot was created.',
            'Missing File Audit: Use --all to find files present locally that were not captured in the snapshot.'
        ]
    };
    async execute(args, options, context) {
        try {
            const { flags, snapshotFile } = this.parseArgs(args);
            const targetDir = flags.directory || process.cwd();
            let snapshot;
            if (context.snapshot) {
                snapshot = context.snapshot;
            }
            else if (snapshotFile) {
                const { loadSnapshotFromFile } = await import('../utils/streaming-json.js');
                snapshot = await loadSnapshotFromFile(snapshotFile, options);
            }
            else {
                const { loadSnapshot } = await import('../utils/streaming-json.js');
                snapshot = await loadSnapshot(context.stdin, options);
            }
            const modifiedFiles = [];
            const missingFiles = [];
            const extraFiles = [];
            // 1. Check files from snapshot
            for (const [filePath, content] of Object.entries(snapshot.files)) {
                const localPath = join(targetDir, filePath);
                if (!existsSync(localPath)) {
                    missingFiles.push(filePath);
                }
                else if (lstatSync(localPath).isDirectory()) {
                    // Path in snapshot is a file, but on disk is a directory (unlikely but possible)
                    missingFiles.push(filePath);
                }
                else {
                    const localContent = readFileSync(localPath, 'utf8');
                    if (localContent !== content) {
                        modifiedFiles.push(filePath);
                    }
                }
            }
            // 2. Check for extra local files (optional, we could walker here)
            // This is more expensive, so we might make it an optional flag --all
            if (flags.all) {
                this.findExtraFiles(targetDir, snapshot.files, extraFiles);
            }
            const result = {
                modifiedFiles,
                missingFiles,
                extraFiles,
                targetDir
            };
            if (options.json) {
                const output = JSON.stringify(result, null, 2);
                return this.success(output);
            }
            else {
                this.printHumanDiff(result, options);
                return this.success();
            }
        }
        catch (err) {
            return this.error(`Diff failed: ${err.message}`, options);
        }
    }
    findExtraFiles(dir, snapshotFiles, extraFiles, baseDir) {
        const root = baseDir || dir;
        const entries = readdirSync(dir);
        for (const entry of entries) {
            const fullPath = join(dir, entry);
            const relativePath = relative(root, fullPath);
            // Basic ignore list (should use .gitignore later)
            if (entry === '.git' || entry === 'node_modules' || entry === 'dist')
                continue;
            if (lstatSync(fullPath).isDirectory()) {
                this.findExtraFiles(fullPath, snapshotFiles, extraFiles, root);
            }
            else if (snapshotFiles[relativePath] === undefined) {
                extraFiles.push(relativePath);
            }
        }
    }
    printHumanDiff(result, options) {
        console.log(`\n🔍 DIFFING SNAPSHOT VS ${result.targetDir}`);
        console.log('─'.repeat(50));
        const tableData = [];
        for (const f of result.modifiedFiles)
            tableData.push(['M', f]);
        for (const f of result.missingFiles)
            tableData.push(['A', f + ' (missing locally)']);
        for (const f of result.extraFiles)
            tableData.push(['D', f + ' (not in snapshot)']);
        if (tableData.length === 0) {
            console.log('✅ No differences found');
        }
        else {
            printTable(['Status', 'Path'], tableData, options);
        }
        console.log();
    }
    parseArgs(args) {
        const flags = {};
        let snapshotFile;
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '--directory' || arg === '-d') {
                flags.directory = args[++i];
            }
            else if (arg === '--all' || arg === '-a') {
                flags.all = true;
            }
            else if (!arg.startsWith('-')) {
                snapshotFile = arg;
            }
        }
        return { flags, snapshotFile };
    }
}
//# sourceMappingURL=diff.js.map