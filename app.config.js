// Web önizleme alt yoldan yayınlanır (ör. /kafadar/pr/12); EXPO_BASE_URL ortamdan gelir.
export default ({ config }) => ({
  ...config,
  web: { bundler: 'metro', output: 'single' },
  experiments: { baseUrl: process.env.EXPO_BASE_URL || undefined },
});
