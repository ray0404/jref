/**
 * Unified Metadata Filename Specification (UMFS) Parser and Validator
 * Version: 1.0.0
 * Provides structural validation, programmatic parsing, and creation utilities
 * for compliant filenames.
 */

export interface UMFSMeta {
  project: string;
  version: string | null;
  tag: string | null;
  date: string | null;
  time: string | null;
  ext: string;
}

export class UMFS {
  // Certified Regular Expression for parsing and validation
  private static readonly UMFS_REGEX = /^(?<project>[a-zA-Z0-9-]+)(?:_(?<version>v\d{2}-\d{2}-\d{2}))?(?:_(?<tag>[a-zA-Z-][a-zA-Z0-9-]+))?(?:_(?<date>\d{8}))?(?:_(?<time>\d{4}|\d{6}))?\.(?<ext>\w+)$/;

  /**
   * Validates if a filename conforms to the UMFS specification.
   * @param filename The raw filename string to test.
   */
  public static isValid(filename: string): boolean {
    return this.UMFS_REGEX.test(filename);
  }

  /**
   * Programmatically parses a filename into structural metadata components.
   * @param filename The raw filename string.
   * @returns UMFSMeta object if valid, otherwise null.
   */
  public static parse(filename: string): UMFSMeta | null {
    const match = filename.match(this.UMFS_REGEX);
    if (!match || !match.groups) {
      return null;
    }

    const groups = match.groups;
    return {
      project: groups.project,
      version: groups.version || null,
      tag: groups.tag || null,
      date: groups.date || null,
      time: groups.time || null,
      ext: groups.ext,
    };
  }

  /**
   * Programmatically builds a compliant UMFS filename from structured metadata.
   * Enforces rules such as blocking underscores in project names and validating structures.
   * @param meta Metadata configuration.
   */
  public static stringify(meta: UMFSMeta): string {
    if (meta.project.includes('_')) {
      throw new Error(`Invalid project name: "${meta.project}". Project names must not contain underscores.`);
    }
    if (!/^[a-zA-Z0-9-]+$/.test(meta.project)) {
      throw new Error(`Invalid project name: "${meta.project}". Only alphanumeric characters and hyphens are allowed.`);
    }

    const parts: string[] = [meta.project];

    if (meta.version) {
      if (!/^v\d{2}-\d{2}-\d{2}$/.test(meta.version)) {
        throw new Error(`Invalid version format: "${meta.version}". Must conform to "vXX-YY-ZZ" (e.g., "v01-02-00").`);
      }
      parts.push(meta.version);
    }

    if (meta.tag) {
      if (!/^[a-zA-Z-][a-zA-Z0-9-]+$/.test(meta.tag)) {
        throw new Error(`Invalid tag: "${meta.tag}". Must start with a letter/hyphen and only contain alphanumerics/hyphens.`);
      }
      parts.push(meta.tag);
    }

    if (meta.date) {
      if (!/^\d{8}$/.test(meta.date)) {
        throw new Error(`Invalid date format: "${meta.date}". Must be exactly 8 digits (YYYYMMDD).`);
      }
      parts.push(meta.date);
    }

    if (meta.time) {
      if (!meta.date) {
        throw new Error('Structural error: Time cannot be supplied without a Date field.');
      }
      if (!/^(?:\d{4}|\d{6})$/.test(meta.time)) {
        throw new Error(`Invalid time format: "${meta.time}". Must be 4 or 6 digits (HHMM or HHMMSS).`);
      }
      parts.push(meta.time);
    }

    const extClean = meta.ext.replace(/^\./, '');
    if (!/^\w+$/.test(extClean)) {
      throw new Error(`Invalid file extension: "${meta.ext}".`);
    }

    return `${parts.join('_')}.${extClean}`;
  }
}
