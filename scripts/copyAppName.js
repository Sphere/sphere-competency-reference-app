const fs = require("fs");
const path = require("path");
const buildType = process.argv[3];
// Get flavor name from command-line arguments
const flavorName = process.argv[2];
console.log(flavorName)

if (!flavorName) {
  console.error("Usage: node updateStrings.js <flavorName>");
  process.exit(1);
}

// Paths to the strings files
const mainPropertiesPath = path.resolve(
  __dirname,
  "../android/app/src/main/res/values/strings.xml" // Updated to align with typical project structure
);
const flavorPropertiesPath = path.resolve(
  __dirname,
  `../buildConfig/${flavorName}/${buildType}/${flavorName}-strings.xml` // Adjusted to match `buildConfig` folder
);

try {
  // Check if the flavor-specific strings file exists
  if (!fs.existsSync(flavorPropertiesPath)) {
    console.error(`Flavor-specific strings.xml not found: ${flavorPropertiesPath}`);
    process.exit(1);
  }

  // Read the flavor-specific strings.xml
  const flavorProperties = fs.readFileSync(flavorPropertiesPath, "utf-8");

  // Write to the main strings.xml
  fs.writeFileSync(mainPropertiesPath, flavorProperties, "utf-8");
  console.log(`Updated ${mainPropertiesPath} with ${flavorPropertiesPath}`);
} catch (error) {
  console.error(`Error updating strings.xml:`, error);
}
