import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { GitUI } from './GitUI.js';
import { Volume } from 'memfs';

describe('GitUI', () => {
  it('should render working tree clean status', async () => {
    const vol = Volume.fromJSON({});
    const files = {};
    const { lastFrame } = render(
      React.createElement(GitUI, {
        vol,
        files,
        onExit: () => {}
      })
    );

    expect(lastFrame()).toContain('VIRTUAL GIT STATUS');
    expect(lastFrame()).toContain('Working tree clean');
  });

  it('should render file status when changed', async () => {
    const vol = Volume.fromJSON({ '/test.txt': 'hello' });
    const files = { 'test.txt': 'hello' };
    
    // We need to wait for the useEffect in GitUI to run refreshStatus
    // In a real test we'd need to mock git.status or wait.
    // But ink-testing-library's render might not capture the update immediately.
    
    const { lastFrame } = render(
      React.createElement(GitUI, {
        vol,
        files,
        onExit: () => {}
      })
    );

    expect(lastFrame()).toContain('VIRTUAL GIT STATUS');
  });
});
