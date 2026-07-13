# Building Libre Remote

## Requirements

- JDK 17
- Android SDK Platform 35
- Android Build Tools 35.0.0 or newer
- Android Studio with Kotlin support

## Debug build

```bash
./gradlew :app:assembleDebug
```

## Release build

Release signing is configured only through environment variables. No private key belongs in source control.

```bash
export LIBRE_KEYSTORE_PATH=/absolute/path/upload-key.jks
export LIBRE_KEYSTORE_PASSWORD='...'
export LIBRE_KEY_ALIAS='...'
export LIBRE_KEY_PASSWORD='...'
./gradlew :app:lintRelease :app:testDebugUnitTest :app:assembleRelease :app:bundleRelease
```

Outputs:

- APK: `app/build/outputs/apk/release/app-release.apk`
- AAB: `app/build/outputs/bundle/release/app-release.aab`

## Reproducibility notes

The project pins the Android Gradle Plugin, Kotlin, KSP and dependency versions. Build artifacts are not committed. CI verifies tests, lint, APK signature and SHA-256 hashes.
