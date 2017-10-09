const webpack = require('webpack');
const path = require('path');

const vendors = [];

const options = {
  output: {
    path: path.join(__dirname, 'src/lib'),
    filename: 'vendors.js',
    library: 'vendors',
  },
  entry: {
    vendor: vendors,
  },
  plugins: [
    new webpack.DllPlugin({
      path: 'manifest.json',
      name: 'vendors',
      context: __dirname,
    }),
    new webpack.optimize.UglifyJsPlugin()
  ],
}

// webpack(webpackConf).run(function(err, stats) {
webpack(options, function (err, stats) {
    // spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
        // context: path.join(__dirname, '../lib'),
        colors: true,
        cached: false,
        modules: true,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
        console.log('  Build failed with errors.\n')
        process.exit(1)
    }

    console.log('  Build complete.\n')
    console.log(
        '  Tip: built files are meant to be served over an HTTP server.\n' +
        '  Opening index.html over file:// won\'t work.\n'
    );
});
