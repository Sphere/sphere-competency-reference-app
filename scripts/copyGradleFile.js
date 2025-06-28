const fs = require('fs');

const source = "configurations/build.gradle";
const destination = "android/build.gradle";

try {
    if (!fs.existsSync(source)) {
        throw new Error(`Source file not found: ${source}`);
    }
    if (!fs.existsSync("android")) {
        throw new Error(`Destination directory not found: android`);
    }

    fs.copyFileSync(source, destination);
    console.log(`Copied ${source} to ${destination} successfully!`);
} catch (error) {
    console.error("Error:", error.message);
}