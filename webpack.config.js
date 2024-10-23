import { fileURLToPath } from 'url'
import path from 'path'

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  entry: './dist/esm/mod.js',
  output: {
    filename: 'bundle.js', // Output single bundled file
    path: path.resolve(__dirname, 'dist', 'umd'), // Output directory
    library: 'bsv',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js'] // Resolve both TypeScript and JavaScript files
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/, // Use ts-loader to transpile TypeScript files
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: true
  }
}
