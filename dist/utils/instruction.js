import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
/**
 * Automatically generates a project instruction based on the contents of the root directory.
 */
export async function generateInstruction(rootDir) {
    const indicators = [];
    // Check for common project types
    if (existsSync(join(rootDir, 'package.json'))) {
        try {
            const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
            indicators.push(`Node.js project named "${pkg.name || 'unknown'}"`);
            if (pkg.dependencies?.['react'] || pkg.devDependencies?.['react']) {
                indicators.push('using React');
            }
            if (pkg.dependencies?.['next'] || pkg.devDependencies?.['next']) {
                indicators.push('built with Next.js');
            }
            if (pkg.devDependencies?.['typescript']) {
                indicators.push('using TypeScript');
            }
        }
        catch {
            indicators.push('Node.js project');
        }
    }
    else if (existsSync(join(rootDir, 'Cargo.toml'))) {
        indicators.push('Rust project');
    }
    else if (existsSync(join(rootDir, 'pyproject.toml')) || existsSync(join(rootDir, 'requirements.txt'))) {
        indicators.push('Python project');
    }
    else if (existsSync(join(rootDir, 'go.mod'))) {
        indicators.push('Go project');
    }
    // Check for common infrastructure
    if (existsSync(join(rootDir, 'docker-compose.yml')) || existsSync(join(rootDir, 'Dockerfile'))) {
        indicators.push('with Docker support');
    }
    if (existsSync(join(rootDir, '.github/workflows'))) {
        indicators.push('with GitHub Actions CI/CD');
    }
    if (indicators.length === 0) {
        return 'This is a project snapshot. Please analyze the directory structure and file contents to understand the architecture.';
    }
    const projectDescription = indicators.join(', ').replace(/, ([^,]*)$/, ' and $1');
    return `This is a ${projectDescription}. Please follow standard conventions for this ecosystem and maintain existing architectural patterns.`;
}
//# sourceMappingURL=instruction.js.map