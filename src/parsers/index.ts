export interface ParserContext {
  command: string;
  args: string[];
}

export interface Parser<T = any> {
  name: string;
  description: string;
  parse: (input: string, context: ParserContext) => T;
}

export class ParserRegistry {
  private parsers = new Map<string, Parser>();

  register(parser: Parser): void {
    this.parsers.set(parser.name, parser);
  }

  get(name: string): Parser | undefined {
    return this.parsers.get(name);
  }

  findForCommand(command: string): Parser | undefined {
    // Try to find a parser named exactly like the command
    return this.parsers.get(command);
  }

  getAllParsers(): Parser[] {
    return Array.from(this.parsers.values());
  }
}

export const parserRegistry = new ParserRegistry();

// Initialize with built-in parsers
import { lsParser } from './ls.js';

parserRegistry.register(lsParser);
