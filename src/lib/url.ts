export const getAppUrl = (subdomain: 'hub' | 'go' = 'hub') => {
  // In development, we use localhost subdomains
  if (process.env.NODE_ENV === 'development') {
    return `http://${subdomain}.localhost:3000`;
  }

  // In production, we use the specific environment variables
  // If not set, fallback to the main app URL (though this shouldn't happen in correct setup)
  if (subdomain === 'go') {
    return process.env.NEXT_PUBLIC_GO_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  }

  return process.env.NEXT_PUBLIC_HUB_URL || process.env.NEXT_PUBLIC_APP_URL || '';
};
