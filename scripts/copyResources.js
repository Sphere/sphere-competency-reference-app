const fs = require("fs-extra");
const path = require("path");

const flavorName = process.argv[2];
const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, `resource/${flavorName}-assets`);
const destinationPath = path.join(rootDir, "assets");

try {
  fs.ensureDirSync(sourcePath);
  fs.ensureDirSync(destinationPath);

  fs.copySync(sourcePath, destinationPath, { overwrite: true });
  console.log(
    `Resources for ${flavorName} flavor copied to the common resources directory successfully.`
  );
} catch (error) {
  console.error(`Error copying resources: ${error}`);
}
