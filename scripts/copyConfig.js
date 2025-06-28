const fs = require("fs");
const path = require("path");

const flavor = process.argv[2];
const buildType = process.argv[3];

if (!flavor || !buildType) {
    console.error("Usage: node copyConfig.js <flavor> <buildType>");
    process.exit(1);
}

const sourceConfigPath = path.join(
    __dirname,
    "..", // Go one level up from the current script
    "buildConfig",
    flavor,
    buildType,
    `capacitor-${flavor}-${buildType}.config.ts`
);

const targetConfigPath = path.join(__dirname, "..", "capacitor.config.ts");

if (!fs.existsSync(sourceConfigPath)) {
    console.error(`Configuration file not found: ${sourceConfigPath}`);
    process.exit(1);
}

try {
    fs.copyFileSync(sourceConfigPath, targetConfigPath);
    console.log(`Configuration file copied for ${flavor} - ${buildType}.`);
} catch (error) {
    console.error("Error copying configuration file:", error);
}
