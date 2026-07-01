module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3001'],
      numberOfRuns: 3,
      settings: {
        // Mobile emulation (Lighthouse default mobile)
        preset: 'desktop',
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 2.625,
          disabled: false,
        },
        throttling: {
          // Simulated mobile throttling
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 0,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 675,
        },
        // Only audit specific categories
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
        // Skip PWA and SEO for speed
        skipAudits: ['is-on-https'],
      },
    },
    assert: {
      assertions: {
        // HARD FAIL: performance must be >= 0.90
        'categories:performance': ['error', { minScore: 0.90 }],
        // WARNINGS ONLY: accessibility and best-practices
        'categories:accessibility': ['warn', { minScore: 0.80 }],
        'categories:best-practices': ['warn', { minScore: 0.80 }],
      },
    },
    upload: {
      // No cloud upload — store reports locally
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
  },
}
