const minimist = require('minimist');

function printHelpText() {
  console.log(`
  IMAGE TRANSMUTATION

  This is a helper script that automatically converts and resizes your images based on the arguments given.

  Available arguments:
    --help, -h        Displays this help text
    
    --run, -r         Executes the script
      --sourceFolder      REQUIRED - The relative or absolute path to the folder where the images currently are.
      --targetFolder      REQUIRED - The relative or absolute path to the destination folder where the converted images will be saved at. Warning: all contents in the folder will be deleted prior to execution.
      --inputFormats      REQUIRED - The existing formats that the script will look for, like jpg and png.
      --targetFormats     REQUIRED - The formats the script will convert to.
      --widths            Optional - The widths to which the images will be resized to. If not declared, images will be kept at their original size.
      --enlarge           Optional - Defines if images should be enlarged in case their original width is smaller than the target size defined on --widths.
      --clearTarget       Optional - Defines if the targetFolder should be cleared (all files deleted) before the optimization runs.
  `);
}

export function cli() {
  let args = minimist(process.argv.slice(2));
  if (args.run === true || args.R === true || args.r === true) {
    const transmuter = require('./transmuter.js');
    const result = transmuter.run(args);
    if (!result) {
      printHelpText();
    }
  } else if (args.help === true || args.H === true || args.h === true) {
    printHelpText();
  } else {
    printHelpText();
  }
}