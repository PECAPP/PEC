import { defineConfig } from 'orval';

export default defineConfig({
  pecApi: {
    input: 'http://localhost:4000/api/docs-json',
    output: {
      mode: 'tags-split',
      target: 'src/generated/endpoints.ts',
      schemas: 'src/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      prettier: true,
      override: {
        mutator: {
          path: 'src/api.ts',
          name: 'fetchWithAuth',
        },
      },
    },
  },
});
