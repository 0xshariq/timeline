// Configuration file (optional)
// Copy this to config.json and customize

export default {
  // Default platform to use
  defaultPlatform: 'github',
  
  // Default username
  defaultUsername: '0xshariq',
  
  // Chart settings
  chart: {
    width: 1600,
    height: 800,
    colorScheme: 'vibrant', // default, vibrant, pastel, dark
    showLegend: true,
    maxReposInLegend: 15,
  },
  
  // Fetching settings
  fetch: {
    maxPages: 10, // Max pages to fetch per repo (rate limit protection)
    includeMergeCommits: true,
    timeout: 30000, // 30 seconds
  },
  
  // CLI settings
  cli: {
    verbose: true,
    autoOpen: false,
    showStats: true,
  },
};
