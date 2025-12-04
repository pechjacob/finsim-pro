#!/usr/bin/env node

/**
 * Enhanced release preview with version range breakdown
 * Shows which commits come from current version vs previous versions
 */

const { execSync } = require('child_process');

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
    console.log('✓ Will update all package.json files (root, app, docs)');
    console.log('✓ Will generate CHANGELOG.md entry');
    console.log('✓ Will auto-version documentation');

    // Extract changelog between the --- markers
    const changelogMatch = output.match(/---\n([\s\S]*?)\n---/);
    const changelogContent = changelogMatch ? changelogMatch[1].trim() : '';

    if (!changelogContent || changelogContent.length === 0) {
        console.log('\n⚠️  CHANGELOG:\n');
        console.log('### No conventional commits found since last release');
        console.log('(Version will still bump, but changelog will be empty)');
    } else {
        // Extract the comparison range from the changelog link
        const comparisonMatch = changelogContent.match(/compare\/v([\d.]+)\.\.\.v([\d.]+)/);
        const comparisonFrom = comparisonMatch ? comparisonMatch[1] : 'unknown';
        const comparisonTo = comparisonMatch ? comparisonMatch[2] : nextVersion;

        console.log('\n📄 CHANGELOG PREVIEW:\n');
        console.log('-'.repeat(41) + 'START' + '-'.repeat(58));
        console.log(changelogContent);

        // Add version range breakdown if comparison doesn't match current version
        if (comparisonFrom !== currentVersion) {
            console.log('\n' + '='.repeat(104));
            console.log('⚠️  VERSION RANGE BREAKDOWN');
            console.log('='.repeat(104));
            console.log(`\n📌 Comparison shows: v${comparisonFrom} → v${comparisonTo}`);
            console.log(`📌 Current version:  v${currentVersion}`);
            console.log(`\n💡 This means the changelog includes commits from v${comparisonFrom} onwards.`);
            console.log(`   Some commits may have been made AFTER the v${currentVersion} tag was created.`);

            // Try to get commits for each range
            try {
                const commitsFromPrevious = execSync(`git log --oneline v${comparisonFrom}..v${currentVersion}`, { encoding: 'utf-8' }).trim();
                const commitsFromCurrent = execSync(`git log --oneline v${currentVersion}..HEAD`, { encoding: 'utf-8' }).trim();

                if (commitsFromPrevious) {
                    console.log(`\n   #FROM v${comparisonFrom} TO v${currentVersion}:`);
                    commitsFromPrevious.split('\n').forEach(line => console.log(`     ${line}`));
                }

                if (commitsFromCurrent) {
                    console.log(`\n   #FROM v${currentVersion} TO HEAD:`);
                    commitsFromCurrent.split('\n').forEach(line => console.log(`     ${line}`));
                } else {
                    console.log(`\n   #FROM v${currentVersion} TO HEAD:`);
                    console.log(`     NONE (no new commits since v${currentVersion})`);
                }
            } catch (err) {
                console.log(`\n   (Could not fetch commit details: ${err.message})`);
            }
            console.log('\n' + '='.repeat(104));
        }

        console.log('-'.repeat(42) + 'END' + '-'.repeat(59));
    }

    // Show docs impact
    console.log('\n📚 DOCS IMPACT:\n');
    console.log(`✓ Will create versioned docs: /docs/versioned_docs/version-${nextVersion}/`);
    console.log(`✓ Will update docs/versions.json`);
    console.log(`✓ Will update docs/docs/sdlc/index.md (Release Notes)`);
    console.log(`  - v${nextVersion} will become "(Current)"`);
    console.log(`  - v${currentVersion} will no longer be "(Current)"`);

    console.log('\n' + '#'.repeat(50));

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
