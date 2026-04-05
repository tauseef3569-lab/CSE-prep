# CSE Prep Master - Android App

This is the Android version of the CSE Prep Master study tracking web app, built with Capacitor.

## Project Structure

- `index.html`, `css/`, `js/` - Web app source files
- `capacitor.config.json` - Capacitor configuration
- `android/` - Android project (Gradle)

## Prerequisites for Building

To build the APK, you need:

1. **64-bit Linux/macOS/Windows** machine (32-bit systems are NOT supported)
2. **Java Development Kit (JDK) 17 or 21** (LTS recommended)
3. **Android SDK** with:
   - Android SDK Platform 36 (Android 15)
   - Android SDK Build-Tools 35.0.0 or higher
   - Android SDK Platform-Tools
4. **Gradle** (the wrapper is included, so Gradle will auto-download)

Alternatively, you can use **Android Studio** which includes all the above.

## Building the APK

### From Command Line

Open a terminal in this project directory and run:

```bash
# On Linux/macOS:
cd android
./gradlew assembleDebug   # for debug APK (unsigned, for testing)
# or
./gradlew assembleRelease # for release APK (requires signing config)
```

The generated APK(s) will be located at:

- Debug: `android/app/build/outputs/apk/debug/`
- Release: `android/app/build/outputs/apk/release/`

### Multi-ABI Builds

The project is configured to build separate APKs for each CPU architecture:
- `app-arm64-v8a-debug.apk` - 64-bit ARM (most modern devices)
- `app-armeabi-v7a-debug.apk` - 32-bit ARM (older devices)
- `app-universal-debug.apk` - Universal (contains all architectures)

This reduces APK size for each device.

## Installing the APK

1. Enable "Unknown sources" or "Install unknown apps" for your file manager/terminal app.
2. Transfer the APK to your Android device.
3. Tap the APK to install.

For debug builds, you may see a warning about the app being from an untrusted source. This is normal.

## Creating a Release APK (for distribution)

1. Edit `android/app/build.gradle` and configure signing:
   ```gradle
   buildTypes {
       release {
           minifyEnabled false
           proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           signingConfig config.signingConfigs.release
       }
   }
   signingConfigs {
       release {
           storeFile file('your-keystore.jks')
           storePassword 'your-password'
           keyAlias 'your-key-alias'
           keyPassword 'your-password'
       }
   }
   ```
2. Run `./gradlew assembleRelease`
3. The signed release APK will be in `app/release/`.

**Do not commit your keystore or passwords to version control.**

## Important Notes

- Building on **32-bit Linux is not supported** due to Android build tools (aapt2) requiring 64-bit. Use a 64-bit system.
- The first build may take several minutes as Gradle downloads dependencies.
- Ensure `local.properties` contains the correct `sdk.dir` path to your Android SDK.

## Troubleshooting

- **"SDK location not found"**: Create `local.properties` with `sdk.dir=/path/to/Android/sdk`.
- **"Could not find tools.jar"**: Set `JAVA_HOME` to your JDK installation.
- **Out of memory**: Increase Gradle heap size by setting `org.gradle.jvmargs=-Xmx2048m` in `gradle.properties`.
- **Build fails with AAPT2 errors on 32-bit**: You must build on a 64-bit system.

## Customizing the App

- Edit `capacitor.config.json` to change app ID, name, or web directory.
- Add icons and splash screens by placing images in `resources/` and running `npx capacitor-assets generate` (requires cordova-res).
- Modify web app code in `index.html`, `css/`, and `js/`.

Enjoy your CSE Prep Master Android app!
