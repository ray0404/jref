/**
 * Scrape API Tests (fetchImpl-injected, no live network)
 */

import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { scrapeSources, scrapeUrl, scraperVersion } from './scrape.js';

const INDEX_HTML = `<!DOCTYPE html><html><head><title>Example Domain</title>
<meta name="description" content="An example page."></head>
<body><main><h1>Example Domain</h1><p>Hello world.</p>
<nav><a href="/about">About</a></nav>
<a href="/missing">Missing</a>
<a href="https://other.example/x">Elsewhere</a>
</main></body></html>`;

const ABOUT_HTML = `<!DOCTYPE html><html><head><title>About Example</title></head>
<body><main><h1>About</h1><p>About this example.</p>
<a href="/">Home</a></main></body></html>`;

function fixtureFetch(url: string): Promise<Response> {
  if (url === 'https://example.com/') {
    return Promise.resolve(new Response(INDEX_HTML, { status: 200, headers: { 'Content-Type': 'text/html' } }));
  }
  if (url === 'https://example.com/about') {
    return Promise.resolve(new Response(ABOUT_HTML, { status: 200, headers: { 'Content-Type': 'text/html' } }));
  }
  return Promise.resolve(new Response('Not found', { status: 404 }));
}

const fetchImpl = ((input: string | URL | Request) => fixtureFetch(String(input))) as typeof fetch;

describe('scrapeSources', () => {
  it('maps a ScrapeResult to a ScrapedSource (markdown/html/metadata/hash)', async () => {
    const [source] = await scrapeSources(['https://example.com/'], { fetchImpl });

    expect(source.url).toBe('https://example.com/');
    expect(source.engine).toBe('pyscraper-md-ts');
    expect(source.engineVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(source.scrapedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(source.metadata?.title).toBe('Example Domain');
    expect(source.metadata?.description).toBe('An example page.');
    expect(source.markdown).toContain('Hello world.');
    expect(source.html).toContain('Hello world.');
    expect(source.contentHash).toBe(createHash('sha256').update(source.markdown, 'utf8').digest('hex'));
    expect(source.statusCode).toBeNull();
    expect(source.error).toBeNull();
    expect(source.depth).toBe(0);
    expect(source.parentUrl).toBeNull();
    expect(source.dynamic).toBe(false);
    expect(source.rawHtml).toBeUndefined();
    expect(source.internalLinks).toContain('https://example.com/about');
  });

  it('stores rawHtml only with includeRawHtml', async () => {
    const [source] = await scrapeSources(['https://example.com/'], { fetchImpl, includeRawHtml: true });
    expect(source.rawHtml).toContain('<title>Example Domain</title>');
  });

  it('does not store an html_document (it is regenerable)', async () => {
    const [source] = await scrapeSources(['https://example.com/'], { fetchImpl });
    expect(source).not.toHaveProperty('html_document');
    expect(source).not.toHaveProperty('htmlDocument');
  });

  it('throws on failure in single-URL mode', async () => {
    await expect(
      scrapeSources(['https://example.com/missing'], { fetchImpl })
    ).rejects.toThrow(/404/);
  });

  it('throws when no URLs are given', async () => {
    await expect(scrapeSources([], { fetchImpl })).rejects.toThrow(/at least one URL/);
  });

  it('crawls same-domain links with depth/parentUrl and tolerates a failed page', async () => {
    const sources = await scrapeSources(['https://example.com/'], {
      fetchImpl,
      crawl: true,
      depth: 2,
      maxPages: 10,
    });

    const urls = sources.map((s) => s.url);
    // Seed + /about + /missing (failed, but recorded); external link never followed.
    expect(urls).toContain('https://example.com/');
    expect(urls).toContain('https://example.com/about');
    expect(urls).toContain('https://example.com/missing');
    expect(urls).not.toContain('https://other.example/x');

    const about = sources.find((s) => s.url === 'https://example.com/about')!;
    expect(about.depth).toBe(1);
    expect(about.parentUrl).toBe('https://example.com/');
    expect(about.markdown).toContain('About this example.');

    const missing = sources.find((s) => s.url === 'https://example.com/missing')!;
    expect(missing.markdown).toBe('');
    expect(missing.html).toBe('');
    expect(missing.error).toMatch(/404/);
  });

  it('scrapeUrl returns a single source', async () => {
    const source = await scrapeUrl('https://example.com/', { fetchImpl });
    expect(source.url).toBe('https://example.com/');
  });

  it('scraperVersion reports the installed package version', () => {
    expect(scraperVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
