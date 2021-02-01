# Image Transmutation 🧙💫

This is a helper script built with NodeJS that automatically converts and resizes your images based on the given arguments. It uses [Sharp](https://github.com/lovell/sharp) to do the necessary conversions.

It is currently only usable through command line, however I plan on making it easier to access in the future.

I have written [a blog post about optimizing images](https://fantinel.dev/web-images-modern-formats/), which includes usage of this script, if you'd like to read more about use cases for it.

**Why transmutation?** Transmutation is the action of altering the properties of an object or being (or an image file). It is also a school of magic in many fantasy universes! 🎲

## How to run/build

0. You must have NodeJS installed on your machine;
1. Clone this repository `git clone https://github.com/matfantinel/image-transmutation`;
2. Open the project folder `cd image-transmutation`;
3. Run `npm install` to install the script's dependencies;
4. You can execute the script by calling `node index.js` to see the available options;



## Available arguments
```
  --help, -h        Displays this help text

  --run, -r         Executes the script
    --sourceFolder      REQUIRED - The relative or absolute path to the folder where the images currently are.
    --targetFolder      REQUIRED - The relative or absolute path to the destination folder where the converted images will be saved at. Warning: all contents in the folder will be deleted prior to execution.
    --inputFormats      REQUIRED - The existing formats that the script will look for, like jpg and png.
    --targetFormats     REQUIRED - The formats the script will convert to.
    --widths            Optional - The widths to which the images will be resized to. If not declared, images will be kept at their original size.
    --enlarge           Optional - Defines if images should be enlarged in case their original width is smaller than the target size defined on --widths.
```

## Example command
This command runs using the folders built-in to this repository. It takes jpg, jpeg and png images and converts them into webp and avif, with widths of 500px and 1000px.

```
node ./index.js --run --sourceFolder "testing-room/source" --targetFolder "testing-room/target" --inputFormats "jpg" --inputFormats "jpeg" --inputFormats "png" --outputFormats "webp" --outputFormats "avif" --widths 500 --widths 1000 --enlarge
```

As a result:

```
/testing-room
  /source
    fluid.png
```

generates
```
/testing-room
  /target
    fluid-500w.avif
    fluid-500w.webp
    fluid-1000w.avif
    fluid-1000w.webp
```
