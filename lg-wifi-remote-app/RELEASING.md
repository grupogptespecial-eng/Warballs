# Releasing

1. Update version code/name and `CHANGELOG.md`.
2. Run unit tests, release lint and a release APK/AAB build.
3. Complete the physical compatibility matrix and Play pre-launch testing.
4. Configure the permanent upload key in GitHub Actions secrets.
5. Confirm the HTTPS privacy-policy URL and Play Data Safety declaration.
6. Tag the exact reviewed commit using `vX.Y.Z`.
7. Run the signed release workflow and verify signature/checksums.
8. Upload the AAB to the intended Play track.
9. Record the Play release ID, tested devices and known issues.
10. Publish the source archive and checksums with the release.

Never replace the signing key, application ID or first production artifact without a documented migration plan.
