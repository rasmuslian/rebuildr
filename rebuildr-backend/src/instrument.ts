import 'dotenv/config';
import * as Sentry from '@sentry/nestjs';
console.log(process.env.NODE_ENV);
Sentry.init({
  dsn: 'https://c17e6469eaf4c052b2644f7d64ce5ec9@o115197.ingest.us.sentry.io/4510306685616128',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 1.0,
  environment:
    process.env.NODE_ENV === 'production' ? 'production' : 'development',
  integrations: [
    Sentry.graphqlIntegration({
      ignoreResolveSpans: false,
      useOperationNameForRootSpan: true,
    }),
  ],
});
