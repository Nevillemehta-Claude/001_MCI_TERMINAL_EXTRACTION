import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const sentryEnabled = Boolean(
    env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT
  );

  return {
    plugins: [
      react(),
      // Sentry Vite Plugin for automatic sourcemap upload
      // Only enabled in production builds with proper credentials
      isProduction &&
        sentryEnabled &&
        sentryVitePlugin({
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT || 'mci-frontend',
          authToken: env.SENTRY_AUTH_TOKEN,

          // Sourcemap configuration
          sourcemaps: {
            // Include all source files
            assets: ['./dist/**'],
            // Delete sourcemaps after upload (security)
            deleteFilesAfterUpload: ['./dist/**/*.map'],
          },

          // Release configuration
          release: {
            // Use git SHA or version from env
            name: env.VITE_APP_VERSION || env.GITHUB_SHA || 'dev',
            // Clean up old releases
            cleanArtifacts: true,
            // Set deploy environment
            setCommits: {
              auto: true,
              ignoreMissing: true,
            },
          },

          // Telemetry (disable in CI)
          telemetry: !process.env.CI,

          // Debug mode in development
          debug: !isProduction,
        }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      proxy: {
        '/api': 'http://localhost:3000',
      },
    },

    // Build configuration
    build: {
      // Generate sourcemaps for Sentry
      sourcemap: isProduction ? 'hidden' : true,

      // Optimize for production
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: false, // Keep console for Sentry breadcrumbs
              drop_debugger: true,
            },
          }
        : undefined,

      // Output configuration
      rollupOptions: {
        output: {
          // Chunk naming for better debugging
          chunkFileNames: isProduction
            ? 'assets/[name]-[hash].js'
            : 'assets/[name].js',
          entryFileNames: isProduction
            ? 'assets/[name]-[hash].js'
            : 'assets/[name].js',
          assetFileNames: isProduction
            ? 'assets/[name]-[hash].[ext]'
            : 'assets/[name].[ext]',
        },
      },
    },

    // Define environment variables
    define: {
      __SENTRY_ENABLED__: JSON.stringify(sentryEnabled),
      __APP_VERSION__: JSON.stringify(
        env.VITE_APP_VERSION || env.GITHUB_SHA || 'dev'
      ),
    },
  };
});
