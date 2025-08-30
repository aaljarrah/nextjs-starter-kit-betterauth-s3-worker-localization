import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const nextConfig: NextConfig = {
  // Enable source maps in production for better debugging
  productionBrowserSourceMaps: true,
};

export default withNextIntl(nextConfig);
