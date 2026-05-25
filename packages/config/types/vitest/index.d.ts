/**
 * @typedef {object} VitestConfigOptions
 * @property {string} importMetaUrl
 * @property {string} [aliasPath]
 * @property {Record<string, unknown>} [test]
 * @property {Record<string, unknown>} [resolve]
 */
/**
 * @param {VitestConfigOptions} options
 */
export function createVitestConfig({ importMetaUrl, aliasPath, test, resolve, }: VitestConfigOptions): {
    test: {
        globals: boolean;
    };
    resolve: {
        alias: {
            [x: string]: string;
        };
    };
};
export type VitestConfigOptions = {
    importMetaUrl: string;
    aliasPath?: string | undefined;
    test?: Record<string, unknown> | undefined;
    resolve?: Record<string, unknown> | undefined;
};
