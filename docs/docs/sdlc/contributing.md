# Contributing

## Development Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/pechjacob/finsim-pro.git
   cd finsim-pro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development servers**:
   ```bash
   npm run dev:all
   ```
   - App: http://localhost:3000/finsim-pro/
   - Docs: http://localhost:3001/finsim-pro/docs/

## Workflow

1. **Create feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes** using conventional commits:
   ```bash
   git add .
   git commit -m "feat(chart): add new visualization option"
   ```

3. **Push and create PR**:
   ```bash
   git push origin feat/your-feature-name
   ```

4. **After merge**, create release:
   ```bash
   git checkout main
   git pull
   npm run release
   git push --follow-tags origin main
   ```
