import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    reposters: 'verbose',

    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
})
