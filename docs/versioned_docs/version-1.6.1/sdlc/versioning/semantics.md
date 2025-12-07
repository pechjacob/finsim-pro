# Semantic Versioning

FinSim Pro follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

## What is SemVer?

Given a version number `MAJOR.MINOR.PATCH`, increment the:

1. **MAJOR** version when you make incompatible API changes
2. **MINOR** version when you add functionality in a backward compatible manner
3. **PATCH** version when you make backward compatible bug fixes

## Examples

| Change | Version Bump | Example |
|--------|--------------|---------|
| Bug fix | PATCH | 1.0.0 → 1.0.1 |
| New feature (backward compatible) | MINOR | 1.0.0 → 1.1.0 |
| Breaking change | MAJOR | 1.0.0 → 2.0.0 |

## Pre-release Versions

```
1.0.0-alpha.1
1.0.0-beta.1
1.0.0-rc.1
```

## Why SemVer?

- **Predictability**: Users know what to expect
- **Compatibility**: Clear indication of breaking changes
- **Automation**: Tools can determine upgrade safety
