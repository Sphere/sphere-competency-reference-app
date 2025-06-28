**Dependencies:**    
NPM Version - 10.7.0  
Node JS Version - 18.20.3   

**1. Ionic-Android build Setup**    
    - [Install java](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)    
    - [Install Gradle](https://gradle.org/install/)    
    - [Install Android Studio](https://developer.android.com/studio/)   
    - After Android studio installation, install SDK    
    - Open Android studio and goto `settings/appearance and behavior/system settings/Android SDK`    
    - Install appropriate Android sdk platform package.    
    - Add environment variables in `~/.bashrc` or `~/.bash_profile` as follows    
        ```export ANDROID_SDK_ROOT=path_to_sdk```    
        ```export PATH=$PATH:$ANDROID_SDK_ROOT/tools/bin```    
        ```export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools```    
    - Reference: https://ionicframework.com/docs/installation/android    
 
    CLI Setup    
    - `npm install -g ionic`   
    - `npm install -g @angular/cli@15`
    - `npm i @capacitor/cli@6.0.0 -g`
    - `npm install -g cordova-res`   

**2. Project Setup**    
  ## Step-1 :
    - git clone the repo(https://github.com/Sphere/mobile-app-v2).  
    - Update appId and appName in capacitor.config.ts file
    - update NAMESPACE, APPLICATION_ID, BASE_URL, CHANNEL_ID, VERSION_NAME and SITEPATH in configurations/configuration.stag.ts file for staging build.
    - For a production build, update the same variables in configurations/configuration.dev.ts
    - Add `google-service.json` file in configurations folder
    - Add splash screen and app_icon in the assets folder as splash.png & icon.png
    - If you want to add organisation access_token then you can add in src/assets/configuratios/apps.json as a secret_key : 
        `"API": {
            "secret_key": ""
        }`
  ## Step-2 :
    - npm i
    - npx cap add android
  ## Step-3 :
    1. Add the below code into the android/gradle.properties file and check the other properties like app_name, app_id etc.
      ```
        android.enableJetifier=true
        def enableProguardInReleaseBuilds = true
        android.enableR8=true
      ```
    2. ng build
    3. npx cap sync android  
    4. npm run ionic-build  

**Onboarding Configurations**
 # create a new user
 - Language Selection|User should select their prefered language
 - Enter first_name, last_name, and phone_number/email_id
 - Choose authentication method: OTP or Password.
 - Submit OTP to create an account
  

**4. How to build apk**    
    - To check attached devices do `adb devices`    
    - `npm run ionic-build` (Make sure you have attached device)    
    - `ionic cordova run android --prod`    
    - Apk location `project_folder/android/app/build/outputs/apk/(staging/appName)/debug/apk_name.apk`    

**5. How to debug apk**    
    - Open chrome and enter `chrome://inspect`    
    - Select app    

---------------------------------------
# IOS Development setup
## Prerequisites
    1. NPM Version - 10.7.0
    2. Node JS Version - 18.20.3
    2. Ionic 5.4.16 using `npm i ionic@5.4.16 -g`
    3. Cordova 6.0.0  using `npm i @capacitor/cli@6.0.0 -g`
    4. cordova-res 0.15.4 - using `npm install -g cordova-res`
    5. ios-deploy  1.12.2 - using `brew install ios-deploy`
    all of the above should be installed globally
    Xcode 16.0 Build version 16A242d or above

    NOTE: For M1 chipset users please go through FAQ section for ROSETA 2 compatibility and usage.
    
## Steps
    1. Checkout sphere-mobile-app repo from https://github.com/Sphere/mobile-app-v2
    2. cd to <mobile-app-v2> local path
    Update appId and appName in capacitor.config.ts file
    3. update NAMESPACE, APPLICATION_ID, BASE_URL, CHANNEL_ID, VERSION_NAME and SITEPATH in configurations/configuration.stag.ts file for staging build.
    4. For a production build, update the same variables in configurations/configuration.dev.ts
    5. Add `google-service.json` file in configurations folder
    6. Add splash screen and app_icon in the assets folder as splash.png & icon.png
    7 If you want to add organisation access_token then you can add in src/assets/configuratios/apps.json as a secret_key :
        `"API": {
            "secret_key": ""
        }`
    8. Remove the below plugin from package.json
    -"sb-cordova-plugin-utility": "git+https://github.com/Sunbird-Ed/sb-cordova-plugin-utility.git#release-6.0.0",
    9. RUN npm i
    10. RUN ng build
    11. RUN npx cap add ios, npx cap sync
    12. RUN npm run ionic-build:ios
## FAQ
1. error: Value for SWIFT_VERSION cannot be empty. (in target 'Sunbird' from project 'Sunbird') or Duplicate GoogleService-Info.plist file error
  open platforms/ios/Sunbird.xcworkspace 
  Select Sunbird 
  Build setting Project, targets
  update Swift language version to 4 
  Inside Tagets -> Build phases -> Copy Bundle Resources -> remove duplicate GoogleService-Info.plist if present
  and close Xcode then rerun the **cordova emulate ios**
2. M1 Chipset users - Turn off ROSETA for XCODE 
  Open Applications -> Right Click Xcode -> Click on Get Info -> Unchek Open with Roseta
  Once `build-ios.sh` is completed, open platforms/ios/Sunbird.xcworkspace and run the application by clicking on Play button
3. Install Java on Mac
  Check if JAVA is already insalled or not by running following command in terminal
  `javac --version` if you get the verdetails then it's installed already
  Check the installation path in `/Library/Java/JavaVirtualMachines`
  Check is JAVA_HOME is set by runnig `echo $JAVA_HOME`, if you get the installation path as output then JAVA_HOME is set
  For Further details follow the link - https://stackoverflow.com/a/50683158/4259981
4. (iOS Setup only) POD installation - https://cocoapods.org/
5. (Android Setup only) Gradle installation - https://gradle.org/install/

