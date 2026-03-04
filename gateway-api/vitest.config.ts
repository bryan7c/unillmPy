import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        root: './',
        environment: 'node',
        include: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'src/main.ts',
                'src/**/*.module.ts',
                '**/*.spec.ts',
                '**/*.e2e-spec.ts',
                'test/**/*',
                'dist/**/*',
            ],
        },
        alias: {
            '@': '/src',
        },
    },
    plugins: [
        {
            ...swc.vite({
                module: { type: 'es6' },
            }),
            enforce: 'pre',
        },
    ],
});
