
- `prettier`
  - `standard --fix`
  - `eslint --fix`

## Possible formatter chains

- [`prettier`]
- [`prettier`, `standard`]
- [`prettier`, `eslint`]
- [`standard`]
- [`eslint`]

# Auto determine from `package.json` dependencies

if both eslint and standard found, ignore eslint `['prettier', 'standard']` chain

# Detect executable

Detect from `node_modules` if always
Use static path
Use bundled one

# Detect config

- Detect from dedicated config and also from package.json
- Use mprettier's config

# project specific
