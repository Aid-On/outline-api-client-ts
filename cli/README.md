# 🚀 OLN - Outline CLI

[![npm version](https://badge.fury.io/js/oln-cli.svg)](https://badge.fury.io/js/oln-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Command-line interface for the Outline API, providing easy access to your Outline knowledge base from the terminal.

## ✨ Features

- 🔐 **Secure Authentication** - Multiple ways to configure API credentials
- 📄 **Document Management** - Create, read, update, delete documents
- 📁 **Collection Operations** - Organize documents in collections
- 🔍 **Powerful Search** - Search across your entire knowledge base
- 📤 **Export Capabilities** - Export documents in multiple formats
- 🎨 **Beautiful Output** - Colored output with intuitive icons
- ⚡ **Fast & Efficient** - Built with performance in mind
- 🔧 **Flexible Configuration** - Environment variables or config files

## 📦 Installation

### Global Installation
```bash
npm install -g oln-cli
```

### Using npx
```bash
npx oln-cli
```

### From Source
```bash
git clone https://github.com/aid-on-libs/outline-api-client.git
cd outline-api-client/cli
npm install
npm link
```

## 🔧 Configuration

### API Key Setup

You'll need an API key from your Outline instance. Get one from **Settings → API & Apps** in your Outline workspace.

### Configuration Methods

#### 1️⃣ Environment Variables (Recommended for Security)
```bash
export OUTLINE_API_KEY=your_api_key_here
export OUTLINE_API_URL=https://your-subdomain.getoutline.com/api
```

#### 2️⃣ Configuration File
```bash
oln config set
```
This will prompt you for your API key and save it securely in `~/.oln/config.json`

#### 3️⃣ Command Line Flag
```bash
oln -k your_api_key_here docs list
```

## 📖 Usage

### 🔑 Authentication Commands

```bash
# Test connection and show user info
oln auth info

# Test API connection
oln auth test

# List API keys
oln auth keys
```

### 📄 Document Commands

```bash
# List documents
oln docs list
oln docs list --limit 10 --sort title

# Search documents
oln docs search "query"
oln docs search "query" --collection <collection-id>

# Get document info
oln docs info <document-id>

# Create a new document
oln docs create
oln docs create --title "My Document" --collection <collection-id>

# Update a document
oln docs update <document-id>
oln docs update <document-id> --title "New Title"

# Delete a document
oln docs delete <document-id>
oln docs delete <document-id> --permanent

# Export a document
oln docs export <document-id>
oln docs export <document-id> --format pdf --output document.pdf
```

### 📁 Collection Commands

```bash
# List collections
oln cols list

# Get collection info
oln cols info <collection-id>

# List documents in a collection
oln cols docs <collection-id>

# Create a collection
oln cols create
oln cols create --name "My Collection" --description "Description"

# Update a collection
oln cols update <collection-id>

# Delete a collection
oln cols delete <collection-id>

# Export a collection
oln cols export <collection-id>
oln cols export <collection-id> --format json
```

### ⚙️ Configuration Commands

```bash
# Set configuration (interactive)
oln config set

# Show current configuration
oln config show

# Clear configuration
oln config clear
```

## 💡 Examples

### Creating and Publishing a Document

```bash
# Create a new document interactively
oln docs create

# Or with options
oln docs create \
  --title "Meeting Notes" \
  --collection abc123 \
  --publish
```

### Searching and Exporting

```bash
# Search for documents
oln docs search "API documentation"

# Export search results
oln docs search "API" --limit 5 | \
  xargs -I {} oln docs export {} --format markdown
```

### Batch Operations

```bash
# List all documents in a collection and export them
oln cols docs <collection-id> --limit 100 | \
  grep "ID:" | \
  awk '{print $2}' | \
  xargs -I {} oln docs export {} --output "exports/{}.md"

# Backup entire collection structure
for col in $(oln cols list | grep "ID:" | awk '{print $2}'); do
  mkdir -p "backup/$col"
  oln cols export $col --output "backup/$col/collection.json"
  oln cols docs $col | grep "ID:" | awk '{print $2}' | \
    xargs -I {} oln docs export {} --output "backup/$col/{}.md"
done
```

### Advanced Workflows

```bash
# Find and update all documents containing specific text
oln docs search "TODO" | grep "ID:" | awk '{print $2}' | \
  while read id; do
    echo "Processing document $id..."
    oln docs update $id --append "\n\n[Updated on $(date)]"
  done

# Create a document from clipboard content (macOS)
pbpaste | oln docs create --title "From Clipboard" --stdin
```

## 🎨 Output Formats

The CLI provides beautiful, colored output with intuitive icons:

- 📄 Document
- 📁 Collection  
- 👤 User
- 🏢 Team
- 🔑 API Key
- ✅ Success
- ❌ Error
- ⚠️  Warning
- ℹ️  Info

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OUTLINE_API_KEY` | Your Outline API key | - |
| `OUTLINE_API_URL` | Your Outline API URL | `https://app.getoutline.com/api` |
| `OLN_CONFIG_PATH` | Custom config file path | `~/.oln/config.json` |
| `NO_COLOR` | Disable colored output | `false` |

## 🚑 Troubleshooting

### API Key Issues

If you're getting authentication errors:

1. Verify your API key is correct
   ```bash
   oln auth test
   ```
2. Check that your API URL matches your Outline instance
3. Ensure your API key has the necessary permissions

### Connection Issues

If you can't connect:

1. Check your internet connection
2. Verify the API URL is correct (should end with `/api`)
   ```bash
   curl -I https://your-subdomain.getoutline.com/api
   ```
3. Make sure your Outline instance is accessible
4. Check for proxy settings if behind a corporate firewall

### Common Errors

| Error | Solution |
|-------|----------|
| `ENOTFOUND` | Check your API URL |
| `401 Unauthorized` | Verify your API key |
| `403 Forbidden` | Check API key permissions |
| `404 Not Found` | Verify document/collection IDs |

## 🛠️ Development

### Setup

```bash
# Clone the repository
git clone https://github.com/aid-on-libs/outline-api-client.git
cd outline-api-client/cli

# Install dependencies
npm install

# Run in development mode
npm run dev -- <command>
```

### Commands

```bash
# Build the project
npm run build

# Type check
npm run type-check

# Run tests
npm test

# Lint code
npm run lint
```

### Project Structure

```
cli/
├── src/
│   ├── commands/     # Command implementations
│   ├── utils/        # Utility functions
│   ├── types/        # TypeScript types
│   └── index.ts      # Entry point
├── dist/             # Built files
└── package.json      # Dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/oln-cli)
- [GitHub Repository](https://github.com/aid-on-libs/outline-api-client)
- [Issues & Feature Requests](https://github.com/aid-on-libs/outline-api-client/issues)
- [Outline Documentation](https://www.getoutline.com/developers)
