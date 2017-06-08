const sloc = require('node-sloc');

const options = {
  path: './',                      // Required. The path to walk or file to read.
  extensions: ['tag', 'jsx', 'less', 'sass'],   // Additional file extensions to look for. Required if ignoreDefault is set to true.
  ignorePaths: ['node_modules', '.git', '.happypack', 'dev', 'dist'],       // A list of directories to ignore.
  ignoreDefault: false,                // Whether to ignore the default file extensions or not
  logger: console.log,                 // Optional. Outputs extra information to if specified.
}

// Using promises
const prettyPrint = (obj) => {
  const str =
  `
    +---------------------------------------------------+
    | SLOC                          | ${obj.sloc.sloc} \t\t|
    |-------------------------------|--------------------
    | Lines of comments             | ${obj.sloc.comments} \t\t|
    |-------------------------------|--------------------
    | Blank lines                   | ${obj.sloc.blank} \t\t|
    |-------------------------------|--------------------
    | Files counted                 | ${obj.sloc.files} \t\t|
    |-------------------------------|--------------------
    | Total LOC                     | ${obj.sloc.loc} \t\t|
    +---------------------------------------------------+
  `
  return str
}

sloc(options).then((res) => {
    console.log("\x1b[32m" + prettyPrint(res))
});

