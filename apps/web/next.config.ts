import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @app/ui se publica como TypeScript fuente (source-based monorepo):
  // Next lo compila junto con la app.
  transpilePackages: ['@app/ui'],
};

export default nextConfig;
