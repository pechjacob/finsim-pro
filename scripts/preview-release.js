#!/usr/bin/env node

/**
 * Enhanced release preview with better messaging
 * Wraps standard-version --dry-run and adds custom output
 */

const { execSync } = require('child_process');
const fs = require('path');

try {
    // Get current version
    const packageJson = require('../package.json');
    const currentVersion = packageJson.version;

    console.log('\n📋 RELEASE PREVIEW (Dry Run)\n');
    console.log(`Current Version: v${currentVersion}`);

    // Run standard-version dry-run
    const output = execSync('npx standard-version --dry-run', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // Parse the output to extract next version
    const versionMatch = output.match(/bumping version in package\.json from ([\d.]+) to ([\d.]+)/);
    const nextVersion = versionMatch ? versionMatch[2] : 'unknown';

    console.log(`Potential Next Version: v${nextVersion}\n`);

    // Show what will happen
    console.log('📝 WILL HAPPEN ON RELEASE:\n');
    console.log(`✓ Will bump version from v${currentVersion} to v${nextVersion}`);
    console.log('✓ Will update package.json and package-lock.json');
    console.log('✓ Will generate CHANGELOG.md entry');

    // Check if there are actual changes
    const changelogMatch = output.match(/### \[([\d.]+)\][\s\S]*?---\s*([\s\S]*?)\s*---/);
    const changelogContent = changelogMatch ? changelogMatch[2].trim() : '';

    if (!changelogContent || changelogContent.length === 0) {
        console.log('\n⚠️  CHANGELOG:\n');
        console.log('### No conventional commits found since last release');
        console.log('(Version will still bump, but changelog will be empty)');
    } else {
        console.log('\n📄 CHANGELOG PREVIEW:\n');
        console.log('---');
        console.log(`### [${nextVersion}](https://github.com/pechjacob/finsim-pro/compare/v${currentVersion}...v${nextVersion}) (${new Date().toISOString().split('T')[0]})`);
        console.log(changelogContent);
        console.log('---');
    }

    // Show docs impact
    console.log('\n📚 DOCS IMPACT:\n');
    console.log(`✓ Will update docs/docs/sdlc/index.md (Release Notes)`);
    console.log(`  - v${nextVersion} will become "(Current)"`);
    console.log(`  - v${currentVersion} will no longer be "(Current)"`);

    // Show next steps
    console.log('\n🚀 NEXT STEPS:\n');
    console.log('To actually release:');
    console.log('  1. npm run release');
    console.log('  2. Review the changes');
    console.log('  3. git push --follow-tags origin main');
    console.log('\nOr use manual version bump:');
    console.log('  - npm run release:patch  (for bug fixes)');
    console.log('  - npm run release:minor  (for new features)');
    console.log('  - npm run release:major  (for breaking changes)');
    console.log('');

} catch (error) {
    console.error('❌ Error running release preview:', error.message);
    process.exit(1);
}
