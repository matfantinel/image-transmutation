const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

let params = {
  sourceFolder: null,
  targetFolder: null,
  inputFormats: null,
  outputFormats: null,
  widths: null,
  enlarge: false
};

function validateParams(args) {
  if (!args) {
    console.error('Missing execution arguments');
    return false;
  }

  params.sourceFolder = args.sourceFolder;
  params.targetFolder = args.targetFolder;
  params.inputFormats = args.inputFormats;
  params.outputFormats = args.outputFormats;
  params.widths = args.widths;
  params.enlarge = args.enlarge;

  if (!params.sourceFolder) {
    console.error('sourceFolder missing');
    return false;
  }
  if (!params.targetFolder) {
    console.error('targetFolder missing');
    return false;
  }
  if (!params.inputFormats) {
    console.error('inputFormats missing');
    return false;
  }

  if (!(params.inputFormats instanceof Array)) {
    params.inputFormats = [ params.inputFormats ];
  }

  if (!(params.outputFormats instanceof Array)) {
    params.outputFormats = [ params.outputFormats ];
  }

  return true;
}

function runAllOptimizations() {
  glob(params.sourceFolder + '/**/*', (err, res) => {
    res.forEach((filepath) => {
      if (
        !fs.lstatSync(filepath).isDirectory() &&
        params.inputFormats.indexOf(path.extname(filepath).split('.').pop().toLowerCase()) >= 0
      ) {
        params.outputFormats.forEach((format) => {
          if (params.widths) {
            params.widths.forEach((width) => {
              optimize(filepath, format, width);
            });
          } else {
            optimize(filepath, format);
          }
        });
      }
    });
  });
}

function optimize(filePath, newFormat, width) {
  const originalFormat = path.basename(filePath).split('.')[1];
  const fileName = path.basename(filePath).split('.')[0];
  const fileRelativePath = filePath.replace(params.sourceFolder, '');

  verifyCreateFolder(path.dirname(`${params.targetFolder}${fileRelativePath}`));

  sharp(filePath)
    .resize(width ? width : null, null, { withoutEnlargement: !params.enlarge })
    .toFile(mountName(), (err) => {
      if (err) {
        console.log(err);
      }
    });

  function mountName() {    
    let res = `${params.targetFolder}${path.dirname(fileRelativePath)}/${fileName}`;
    if (width) {
      res += `-${width}w`;
    }
    res += `.${newFormat ? newFormat : originalFormat}`;

    return res;
  }
}

function verifyCreateFolder(directory, deleteIfExists) {  
  if (fs.existsSync(directory) && deleteIfExists) {
    fs.rmdirSync(directory, { recursive: true });
  }
  fs.mkdirSync(directory, { recursive: true });
}

const run = (args) => {
  if (validateParams(args)) {
    verifyCreateFolder(params.targetFolder, true);
    runAllOptimizations();
    return true;
  } else {
    return false;
  }
}

module.exports = {
  run
}