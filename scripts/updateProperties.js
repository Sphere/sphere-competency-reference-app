const fs = require("fs");
const path = require("path");

// Get flavor name and build type from command-line arguments
const flavorName = process.argv[2];
const buildType = process.argv[3];

if (!flavorName || !buildType) {
  console.error("Usage: node updateGradle.js <flavorName> <buildType>");
  process.exit(1);
}

// Paths to the gradle.properties files
const mainPropertiesPath = path.resolve(__dirname, "../android/gradle.properties");
const flavorPropertiesPath = path.resolve(
  __dirname,
  `../buildConfig/${flavorName}/${buildType}/${flavorName}-gradle.properties`
);

try {
  // Check if the flavor-specific gradle.properties file exists
  if (!fs.existsSync(flavorPropertiesPath)) {
    console.error(`Flavor-specific gradle.properties not found: ${flavorPropertiesPath}`);
    process.exit(1);
  }

  // Read the flavor-specific gradle.properties file
  const flavorProperties = fs.readFileSync(flavorPropertiesPath, "utf-8");

  // Write to the main gradle.properties file
  fs.writeFileSync(mainPropertiesPath, flavorProperties, "utf-8");
  console.log(`Updated ${mainPropertiesPath} with ${flavorPropertiesPath}`);
} catch (error) {
  console.error(`Error updating gradle.properties:`, error);
}
