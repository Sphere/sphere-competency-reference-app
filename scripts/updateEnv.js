const fs = require('fs');
const path = require('path');
const flavor = process.argv[2] // Get the flavor argument
 const scriptDirectory = __dirname;

console.log('update env flavor', flavor)
if (flavor === "stg") {
  // Start updating env file
    // const sourceConfigPath = path.join(__dirname, '../', 'src/environments', 'environment.'+flavor+'.ts');
    // const targetConfigPath = path.join(__dirname, '../', 'src/environments', 'environment.ts');
    // try {
    //   fs.copyFileSync(sourceConfigPath, targetConfigPath);
    //   console.log('environment.ts copied for stg env.');
    // } catch (error) {
    //   console.error('Error copying environment.ts:', error);
    // }
  // #End updating env file

  // Start updating site config file
    const sourceSiteConfigPath = path.join(__dirname, '../', 'src/assets/configurations', 'site.config.'+flavor+'.json');
    const targetSiteConfigPath = path.join(__dirname, '../', 'src/assets/configurations', 'site.config.json');
    try {
      fs.copyFileSync(sourceSiteConfigPath, targetSiteConfigPath);
      console.log('site.config.json copied for stg env.');
    } catch (error) {
      console.error('Error copying site.config.json:', error);
    }
  // #End updating site config file

  // Start updating host config file
    const sourceHostConfigPath = path.join(__dirname, '../', 'src/assets/configurations', 'host.config.'+flavor+'.json');
    const targetHostConfigPath = path.join(__dirname, '../', 'src/assets/configurations', 'host.config.json');
    try {
      fs.copyFileSync(sourceHostConfigPath, targetHostConfigPath);
      console.log('host.config.json copied for stg env.');
    } catch (error) {
      console.error('Error copying host.config.json:', error);
    }
  // #End updating host config file

  // Start updating formreaddata file
    const sourceformreaddataPath = path.join(__dirname, '../', 'src/assets/configurations', 'formreaddata.'+flavor+'.json');
    const targetformreaddataPath = path.join(__dirname, '../', 'src/assets/configurations', 'formreaddata.json');
    try {
      fs.copyFileSync(sourceformreaddataPath, targetformreaddataPath);
      console.log('formreaddata.json copied for stg env.');
    } catch (error) {
      console.error('Error copying formreaddata.json:', error);
    }
  // #End updating formreaddata file

  // Start updating apps data file
    const sourceAppsDataPath = path.join(__dirname, '../', 'src/assets/configurations', 'apps.'+flavor+'.json');
    const targetAppsDataPath = path.join(__dirname, '../', 'src/assets/configurations', 'apps.json');
    try {
      fs.copyFileSync(sourceAppsDataPath, targetAppsDataPath);
      console.log('apps.json copied for stg env.');
    } catch (error) {
      console.error('Error copying apps.json:', error);
    }
  // #End updating apps data file
  
  const filePath = path.join(scriptDirectory, 'buildConfig/sunbird.properties');
  // const envFile = require('src/environments/environment.'+flavor+'.ts');
  // fs.readFile(filePath, 'utf8', (err, data) => {
  //   if (err) {
  //       console.error(`Error reading ${filePath}:`, err);
  //       return;
  //   }
  //   const updatedContent = data.replace(new RegExp('sphere.aastrika.org', 'g'), 'aastrika-stage.tarento.com');
  //   console.log(`Replacing ${'sphere.aastrika.org'} with ${'aastrika-stage.tarento.com'}`);
  //   fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
  //       if (err) {
  //           console.error(`Error writing to ${filePath}:`, err);
  //           return;
  //       }
  //       console.log(`Package name replaced in ${filePath}`);
  //   });
  // });

} else {
  
  // Start updating env file
    // const sourceConfigPath = path.join(__dirname, '../', 'src/environments', 'environment.prod.ts');
    // const targetConfigPath = path.join(__dirname, '../', 'src/environments', 'environment.ts');
    // try {
    //   fs.copyFileSync(sourceConfigPath, targetConfigPath);
    //   console.log('environment.ts copied for prod env.');
    // } catch (error) {
    //   console.error('Error copying environment.ts:', error);
    // }
  // End updating env file

  // Start updating site config file
    const sourceSiteConfigPath = path.join(__dirname, '../', 'src/assets/configurations', 'site.config.prod.json');
    const targetSiteConfigPath = path.join(__dirname, '../', 'src/assets/configurations', 'site.config.json');
    try {
      fs.copyFileSync(sourceSiteConfigPath, targetSiteConfigPath);
      console.log('site.config.json copied for prod env.');
    } catch (error) {
      console.error('Error copying site.config.json:', error);
    }
  // #End updating site config file

  // Start updating host config file
    const sourceHostConfigPath = path.join(__dirname, '../', 'src/assets/configurations', 'host.config.prod.json');
    const targetHostConfigPath = path.join(__dirname, '../', 'src/assets/configurations', 'host.config.json');
    try {
      fs.copyFileSync(sourceHostConfigPath, targetHostConfigPath);
      console.log('host.config.json copied for prod env.');
    } catch (error) {
      console.error('Error copying host.config.json:', error);
    }
  // #End updating host config file

  // Start updating formreaddata file
    const sourceformreaddataPath = path.join(__dirname, '../', 'src/assets/configurations', 'formreaddata.prod.json');
    const targetformreaddataPath = path.join(__dirname, '../', 'src/assets/configurations', 'formreaddata.json');
    try {
      fs.copyFileSync(sourceformreaddataPath, targetformreaddataPath);
      console.log('formreaddata.json copied for prod env.');
    } catch (error) {
      console.error('Error copying formreaddata.json:', error);
    }
  // #End updating formreaddata file

  // Start updating apps data file
    const sourceAppsDataPath = path.join(__dirname, '../', 'src/assets/configurations', 'apps.prod.json');
    const targetAppsDataPath = path.join(__dirname, '../', 'src/assets/configurations', 'apps.json');
    try {
      fs.copyFileSync(sourceAppsDataPath, targetAppsDataPath);
      console.log('apps.json copied for stg env.');
    } catch (error) {
      console.error('Error copying apps.json:', error);
    }
  // #End updating app data file
}

// src/environments/environment.ts
// src/assets/configurations/site.config.stg.json
// src/assets/configurations/host.config.stg.json
// src/assets/configurations/formreaddata.stg.json
// path.resolve(__dirname, 'buildConfig/sunbird.properties');