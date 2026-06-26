/*
 * SE7EN FIT Android release optimizer for Codemagic.
 * Run after: npx expo prebuild --platform android --clean --non-interactive
 * Purpose:
 * - Test/preview APK: build only arm64-v8a to reduce APK size and keep minify off for easier testing.
 * - Production AAB: keep Play Store bundle flow and enable shrink/minify flags.
 * This script only changes generated Android build files. It does not touch app UI.
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const aabMode = process.argv.includes('--aab');
const gradlePropsPath = path.join(root, 'android', 'gradle.properties');
const appBuildGradlePath = path.join(root, 'android', 'app', 'build.gradle');

function fail(message) {
  console.error(`[SE7EN FIT build config] ${message}`);
  process.exit(1);
}

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${filePath}. Run expo prebuild before this script.`);
  }
}

function upsertGradleProperty(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(content)) return content.replace(pattern, line);
  return `${content.trimEnd()}\n${line}\n`;
}

ensureFile(gradlePropsPath);
ensureFile(appBuildGradlePath);

let props = fs.readFileSync(gradlePropsPath, 'utf8');
props = upsertGradleProperty(props, 'android.useAndroidX', 'true');
props = upsertGradleProperty(props, 'android.enableJetifier', 'true');

if (aabMode) {
  props = upsertGradleProperty(props, 'android.enableProguardInReleaseBuilds', 'true');
  props = upsertGradleProperty(props, 'android.enableShrinkResourcesInReleaseBuilds', 'false');
} else {
  props = upsertGradleProperty(props, 'android.enableProguardInReleaseBuilds', 'false');
  props = upsertGradleProperty(props, 'android.enableShrinkResourcesInReleaseBuilds', 'false');
  props = upsertGradleProperty(props, 'reactNativeArchitectures', 'arm64-v8a');
}

fs.writeFileSync(gradlePropsPath, props);

let gradle = fs.readFileSync(appBuildGradlePath, 'utf8');

if (!aabMode && !gradle.includes('include "arm64-v8a"')) {
  gradle = gradle.replace(
    /android\s*\{/,
    `android {\n    splits {\n        abi {\n            enable true\n            reset()\n            include "arm64-v8a"\n            universalApk false\n        }\n    }`
  );
}

if (aabMode) {
  // Ensure minifyEnabled is true only for production AAB builds.
  gradle = gradle.replace(
    /(release\s*\{[^}]*)/s,
    (match) => {
      if (!match.includes('minifyEnabled')) {
        return match.replace(/release\s*\{/, 'release {\n            minifyEnabled true\n');
      }
      return match;
    }
  );
}

fs.writeFileSync(appBuildGradlePath, gradle);

console.log(`[SE7EN FIT build config] Android config applied. Mode: ${aabMode ? 'AAB production' : 'standalone ARM64 test APK'}`);
