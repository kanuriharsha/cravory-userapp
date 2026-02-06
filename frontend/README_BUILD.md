# Build & Publish (Android APK) - Cravory

This guide describes how to build an APK using EAS and upload it to Google Play. I cannot run commands using your credentials or accept passwords — run the commands locally and paste outputs here if you need help.

Prerequisites
- Node.js and npm installed
- `frontend` dependencies installed (`npm install` in `frontend/`)
- An Expo account (email/password)
- (For Play Store) a Google Play Console account and a service account JSON (recommended)

1) Install EAS CLI
```bash
npm install -g eas-cli
```

2) Login to Expo (you enter credentials interactively)
```bash
cd frontend
eas login
# verify
eas whoami
```

3) Ensure `app.json` contains required fields
- `expo.android.package` (e.g., `com.cravory.app`)
- `expo.version` and `expo.versionCode` set

4) Build an APK (we added `eas.json` already)
```bash
# from frontend/
eas build --platform android --profile production
```

When the build completes you'll get a URL pointing to the artifact on expo.dev. Open it and download the APK.

5) Prepare for Play Store upload (recommended: service account)
- In Google Play Console > Settings > API access > Create service account
- Grant `Release Manager` role (or appropriate) to the service account
- Download the JSON key file and keep it secure

6) Submit APK to Play Store with `eas submit` (interactive)
```bash
# from frontend/
eas submit --platform android --profile production
```
Follow prompts and point to the service-account JSON when asked.

Troubleshooting & Help
- If the build fails, copy the full `eas build` CLI output here and I'll help debug.
- Don't paste passwords or private keys in chat. If you need me to inspect files, share the relevant logs or sanitized snippets.

Automating in CI
- Store the Play service-account JSON in secure secrets and run `eas build` + `eas submit` in CI.

If you want, I can also:
- Add an `npm` script wrapper for `eas build` and `eas submit` in `frontend/package.json`.
- Provide a sample GitHub Actions workflow to build and upload securely using secrets.

Which would you like next?
- I can add npm scripts to `frontend/package.json` now.
- Or provide a GitHub Actions YAML for automated builds using a Play service-account secret.
