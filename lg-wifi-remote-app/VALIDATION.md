# Release validation

The final release workflow must pass all of the following on the exact release commit:

- debug unit tests;
- Android release lint with `abortOnError=true`;
- signed release APK;
- release Android App Bundle;
- APK signature verification;
- SHA-256 manifest;
- source archive without build caches or signing material;
- Play Store asset and documentation package.

CI success validates the software build. It does not replace physical TV tests, Play pre-launch reports or account/policy review.
