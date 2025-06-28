const fs = require("fs");
const path = require("path"); // Added for path manipulation
const fsextra = require("fs-extra");
const flavor = process.argv[2];
const { execSync } = require("child_process");
console.log("flavor", flavor);
if (!flavor) {
  console.error("Flavor not specified.");
  process.exit(1);
}

console.log("Adding Android platform...");
const defaultOldPackageName = "org.sunbird.app.R";
const replacements = [
  {
    filePath: "../MainActivity.java",
    oldPackageName:
      flavor === "ekshamata"
        ? "package com.aastrika.sphere"
        : "package org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata"
        ? "package org.aastrika.ekshamata"
        : "package com.aastrika.sphere",
  },
  {
    filePath: "../src/app/app.module.ts",
    oldPackageName:
      flavor === "ekshamata" ? "com.aastrika.sphere" : "org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata" ? "org.aastrika.ekshamata" : "com.aastrika.sphere",
  },
  {
    filePath: "../src/app/app.component.ts",
    oldPackageName:
      flavor === "ekshamata" ? "com.aastrika.sphere" : "org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata" ? "org.aastrika.ekshamata" : "com.aastrika.sphere",
  },
  {
    filePath: "../configurations/google-services.json",
    oldPackageName:
      flavor === "ekshamata" ? "com.aastrika.sphere" : "org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata" ? "org.aastrika.ekshamata" : "com.aastrika.sphere",
  },
  {
    filePath: "../configurations/configuration.dev.ts",
    oldPackageName:
      flavor === "ekshamata" ? "com.aastrika.sphere" : "org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata" ? "org.aastrika.ekshamata" : "com.aastrika.sphere",
  },
  {
    filePath: "../configurations/configuration.stag.ts",
    oldPackageName:
      flavor === "ekshamata" ? "com.aastrika.sphere" : "org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata" ? "org.aastrika.ekshamata" : "com.aastrika.sphere",
  },
  {
    filePath: "../configurations/configuration.ts",
    oldPackageName:
      flavor === "ekshamata" ? "com.aastrika.sphere" : "org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata" ? "org.aastrika.ekshamata" : "com.aastrika.sphere",
  },
  {
    filePath: "../android/app/build.gradle",
    oldPackageName:
      flavor === "ekshamata" ? "com.aastrika.sphere" : "org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata" ? "org.aastrika.ekshamata" : "com.aastrika.sphere",
  },
  {
    filePath: "../android/app/src/main/java/com/aastrika/sphere/MainActivity.java",
    oldPackageName:
      flavor === "ekshamata" ? "com.aastrika.sphere" : "org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata" ? "org.aastrika.ekshamata" : "com.aastrika.sphere",
  },
  {
    filePath: "../capacitor.config.ts",
    oldPackageName:
      flavor === "ekshamata" ? "com.aastrika.sphere" : "org.aastrika.ekshamata",
    newPackageName:
      flavor === "ekshamata" ? "org.aastrika.ekshamata" : "com.aastrika.sphere",
  },
];

// Get the current script's directory
const scriptDirectory = __dirname;

replacements.forEach((replacement) => {
  const { filePath, oldPackageName, newPackageName } = replacement;

  let resolvedOldPackageName =
    oldPackageName === defaultOldPackageName
      ? defaultOldPackageName
      : oldPackageName;
  // Construct the full path using the script's directory
  const fullPath = path.join(scriptDirectory, filePath);
  console.log(`Processing file: ${fullPath}`);
  console.log("File exists:", fs.existsSync(fullPath));

  fs.readFile(fullPath, "utf8", (err, data) => {
    if (data && data.includes(defaultOldPackageName)) {
      resolvedOldPackageName = defaultOldPackageName;
    }
    if (err) {
      console.error(`Error reading ${fullPath}:`, err);
      return;
    }
    const updatedContent = data.replace(
      new RegExp(resolvedOldPackageName, "g"),
      newPackageName
    );

    console.log(`Replacing ${oldPackageName} with ${newPackageName}`);
    fs.writeFile(fullPath, updatedContent, "utf8", (err) => {
      if (err) {
        console.error(`Error writing to ${fullPath}:`, err);
        return;
      }
      console.log(`Package name replaced in ${fullPath}`);
    });
  });
});
