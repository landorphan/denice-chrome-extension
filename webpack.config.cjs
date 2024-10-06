const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require('webpack'); // Required for DefinePlugin
const fs = require('fs');

function modifyManifest(host) {
    const manifestPath = path.resolve(__dirname, 'src', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
    if (manifest.host_permissions) {
        manifest.host_permissions = manifest.host_permissions.filter(
            (permission) => permission.startsWith(host)
        );
    }
  
    // Write the modified manifest back to the filesystem
    const outputPath = path.resolve(__dirname, 'dist', 'manifest.json');
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
}
  

module.exports = (env = {}) => {
    const apiHost = env.API_HOST || 'http://localhost:3000'; // Default to localhost

    return {
        mode: 'production',
        target: 'web',
        entry: {
            // contentScript: './src/content/index.ts',
            activeTab: './src/activeTab/index.ts',
            background: './src/background/index.ts',
            react: './src/react/index.tsx',
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            clean: true,
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
            }),
            {
                apply: (compiler) => {
                  compiler.hooks.afterEmit.tap('ModifyManifestPlugin', (compilation) => {
                    modifyManifest(apiHost);
                  });
                },
            },            
            new CopyPlugin({
                patterns: [
                    // { from: './src/manifest.json', to: path.resolve(__dirname, 'dist') },
                    { from: './src/assets', to: 'assets' },
                ],
            }),
            // Inject the API_HOST environment variable into the build
            new webpack.DefinePlugin({
                'process.env.API_HOST': JSON.stringify(apiHost),
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                ['@babel/preset-react', { runtime: 'automatic' }],
                                '@babel/preset-typescript',
                            ],
                        },
                    },
                },
            ],
        },
        externals: {},
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
    };
};
