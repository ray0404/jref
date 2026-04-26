import re

with open('src/utils/output.test.ts', 'r') as f:
    content = f.read()

# Add a test case for empty/null cells in printTable to cover branches (r[i] || '')
replacement = """    it('should handle undefined/empty cells in table rows', () => {
      printTable(['A', 'B'], [['1', ''], [undefined as any, '4']], {});
      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy.mock.calls[0][0]).toContain('A  B');
      expect(consoleLogSpy.mock.calls[2][0]).toContain('1   '); // Length of B padded to 1
    });

    it('should print formatted table in normal mode', () => {"""

content = content.replace("    it('should print formatted table in normal mode', () => {", replacement)

with open('src/utils/output.test.ts', 'w') as f:
    f.write(content)
