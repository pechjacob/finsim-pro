module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',     // New feature
                'fix',      // Bug fix
                'docs',     // Documentation only
                'style',    // Formatting, no code change
                'refactor', // Code refactoring
                'perf',     // Performance improvement
                'test',     // Adding tests
                'chore',    // Maintenance
                'revert'    // Revert previous commit
            ]
        ],
        'scope-enum': [
            2,
            'always',
            [
                'app',          // Main application
                'docs',         // Documentation site
                'chart',        // Chart component/feature
                'timeline',     // Timeline component
                'simulation',   // Simulation engine
                'formula',      // Formula calculations
                'ui',           // UI components
                'config',       // Configuration
                'deps',         // Dependencies
                'ci',           // CI/CD
                'release'       // Release-related
            ]
        ],
        'subject-case': [2, 'always', 'lower-case'],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'header-max-length': [2, 'always', 100]
    }
};
