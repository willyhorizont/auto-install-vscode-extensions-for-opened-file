# auto-install-vscode-extensions-for-opened-file

## 🚀 Installation Guide (CLI)

You can download and install this extension directly using your terminal via `curl` or `wget`.

### Using `curl`
```bash
# Download the VSIX file
curl -L -o auto-install-vscode-extensions-for-opened-file.vsix https://github.com/willyhorizont/auto-install-vscode-extensions-for-opened-file/releases/download/auto-install-vscode-extensions-for-opened-file-VERSION.vsix

# Install to VS Code
code --install-extension auto-install-vscode-extensions-for-opened-file.vsix
```

### Using `wget`
```bash
# Download the VSIX file
wget https://github.com/willyhorizont/auto-install-vscode-extensions-for-opened-file/releases/download/auto-install-vscode-extensions-for-opened-file-VERSION.vsix

# Install to VS Code
code --install-extension auto-install-vscode-extensions-for-opened-file.vsix
```

---

## 🛠️ Configuration Example

Add this to your Global or Local (`.vscode/settings.json`) settings:

```json
{
    "willyhorizont.github.io/auto-install-vscode-extensions-for-opened-file.language-specific-vscode-extensions": [
        {
            "id": "go",
            "file_extension": ".go",
            "vscode_extensions": [
                "golang.go"
            ]
        }
    ],
    "willyhorizont.github.io/auto-install-vscode-extensions-for-opened-file.base-vscode-extensions": [
        "formulahendry.code-runner"
    ],
    "willyhorizont.github.io/auto-install-vscode-extensions-for-opened-file.ignored-file-extensions": [
        ".txt"
    ]
}
```
