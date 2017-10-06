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

webpack(options).run(function (err, stats) {
    if(err) {
        console.error(err.stack || err);
        if(err.details) console.error(err.details);
        if(!options.watch) {
            process.on("exit", function() {
                process.exit(1); // eslint-disable-line
            });
        }
        return;
    }
    process.stdout.write(stats.toString(options.output) + "\n");
})