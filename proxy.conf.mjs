const tls = process.argv.includes('--ssl');

export default [
  {
    context: ['/api', '/services', '/management', '/v3/api-docs', '/swagger-ui', '/h2-console', '/auth', '/health'],
    target: `http${tls ? 's' : ''}://localhost:8088`,
    secure: false,
    changeOrigin: tls,
  },
];
