import { defineConfig } from '@prisma/client/generator';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});
