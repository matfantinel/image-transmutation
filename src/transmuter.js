import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import glob from 'glob';

let params = {
  sourceFolder: null,
  targetFolder: null,
  inputFormats: null,
  outputFormats: null,
  widths: null,
  maxWidth: null,
  enlarge: false,
  clearTarget: false,
  ignoreCache: false
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
  params.maxWidth = args.maxWidth;
  params.enlarge = args.enlarge;
  params.clearTarget = args.clearTarget;
  params.ignoreCache = args.ignoreCache;

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

  if (!(params.widths instanceof Array)) {
    params.widths = [ params.widths ];
  }

  if (params.maxWidth !== undefined && params.maxWidth !== null) {
    params.maxWidth = Number(params.maxWidth);
    if (!Number.isFinite(params.maxWidth) || params.maxWidth <= 0) {
      console.error('maxWidth must be a positive number');
      return false;
    }
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
        console.log(`Optimizing ${filepath}`);
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
  const originalFormat = path.extname(filePath).split('.').pop().toLowerCase();
  const fileName = path.basename(filePath).split('.')[0];
  const fileRelativePath = filePath.replace(params.sourceFolder, '');

  verifyCreateFolder(path.dirname(`${params.targetFolder}${fileRelativePath}`));

  // Check if file already exists
  if (!params.ignoreCache && fs.existsSync(mountName())) {
    // Check if target file's last modified date is newer than the source file's
    const sourceModified = fs.statSync(filePath).mtimeMs;
    const targetModified = fs.statSync(mountName()).mtimeMs;
    
    if (targetModified > sourceModified) {
      // If yes, means it's already been optimized
      console.log(`File already optimized. Skipping...`);
      return;
    }
  }

  const isFullSize = width === 'full';

  const image = sharp(filePath).rotate();
  if (!isFullSize && width) {
    image.resize(width, null, { withoutEnlargement: !params.enlarge });
  } else if (params.maxWidth) {
    image.resize(params.maxWidth, null, { withoutEnlargement: true });
  }

  // Apply format-specific optimization
  const outputFormat = newFormat ? newFormat : originalFormat;
  if (outputFormat === 'png') {
    image.png({ compressionLevel: 9, quality: 100 });
  } else if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
    image.jpeg({ quality: 80, progressive: true });
  } else if (outputFormat === 'webp') {
    image.webp({ quality: 80 });
  } else if (outputFormat === 'avif') {
    image.avif({ quality: 80 });
  }
  
  image.toFile(mountName(), (err, info) => {
    if (err) {
      console.log(err);
      return;
    }
    keepOriginalIfSmaller(info);
  });

  function keepOriginalIfSmaller(info) {
    const sameFormat =
      outputFormat === originalFormat ||
      ([ 'jpg', 'jpeg' ].includes(outputFormat) && [ 'jpg', 'jpeg' ].includes(originalFormat));
    if (!sameFormat || info.size <= fs.statSync(filePath).size) {
      return;
    }
    sharp(filePath).metadata().then((meta) => {
      const rotated = meta.orientation >= 5;
      const sourceWidth = rotated ? meta.height : meta.width;
      const sourceHeight = rotated ? meta.width : meta.height;
      if (info.width === sourceWidth && info.height === sourceHeight) {
        fs.copyFileSync(filePath, mountName());
        console.log(`Optimized file was larger than the original. Kept original: ${mountName()}`);
      }
    }).catch((metaErr) => console.log(metaErr));
  }

  function mountName() {    
    let res = `${params.targetFolder}${path.dirname(fileRelativePath)}/${fileName}`;
    if (width && width !== 'full') {
      res += `-${width}w`;
    }
    res += `.${newFormat ? newFormat : originalFormat}`;

    return res;
  }
}

function verifyCreateFolder(directory, deleteIfExists) {  
  if (fs.existsSync(directory) && deleteIfExists) {
    console.log('Deleting folder');
    fs.rmdirSync(directory, { recursive: true });
  }
  fs.mkdirSync(directory, { recursive: true });
}

const run = (args) => {
  if (validateParams(args)) {
    verifyCreateFolder(params.targetFolder, Boolean(params.clearTarget));
    runAllOptimizations();
    return true;
  } else {
    return false;
  }
}

export default run;