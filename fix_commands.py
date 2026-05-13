import os
import glob
import re

command_files = glob.glob('src/commands/*.ts')

for file in command_files:
    with open(file, 'r') as f:
        content = f.read()

    # Check if type CommandDefinition is imported
    if 'type CommandDefinition' in content or 'CommandDefinition' in content:
        # Check if the import is only used for the readonly definition property
        if re.search(r'readonly definition:\s*CommandDefinition\s*=', content):
            # Remove the explicit type from definition
            new_content = re.sub(r'readonly definition:\s*CommandDefinition\s*=', 'readonly definition =', content)

            # Remove CommandDefinition from imports
            new_content = re.sub(r'import\s+\{\s*Command\s*,\s*type\s*CommandDefinition\s*\}\s+from\s+[\'"]\.\./utils/command\.js[\'"];', 'import { Command } from \'../utils/command.js\';', new_content)

            # For serve.ts which imports registry as well
            new_content = re.sub(r'import\s+\{\s*Command\s*,\s*type\s*CommandDefinition\s*,\s*registry\s*\}\s+from\s+[\'"]\.\./utils/command\.js[\'"];', 'import { Command, registry } from \'../utils/command.js\';', new_content)

            # For graph.ts which doesn't use 'type' keyword
            new_content = re.sub(r'import\s+\{\s*Command\s*,\s*CommandDefinition\s*\}\s+from\s+[\'"]\.\./utils/command\.js[\'"];', 'import { Command } from \'../utils/command.js\';', new_content)

            with open(file, 'w') as f:
                f.write(new_content)
            print(f"Updated {file}")
