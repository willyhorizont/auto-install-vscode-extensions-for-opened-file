# auto-install-vscode-extensions-for-opened-file

## 🚀 Installation Guide (CLI)

You can download and install this extension directly using your terminal via `curl` or `wget`.

### Using `curl`
```bash
# Download the VSIX file
curl -L -o willyhorizont.auto-install-vscode-extensions-for-opened-file.vsix https://github.com/willyhorizont/auto-install-vscode-extensions-for-opened-file/releases/latest/download/willyhorizont.auto-install-vscode-extensions-for-opened-file.vsix

# Install to VS Code
code --install-extension willyhorizont.auto-install-vscode-extensions-for-opened-file.vsix
```

### Using `wget`
```bash
# Download the VSIX file
wget https://github.com/willyhorizont/auto-install-vscode-extensions-for-opened-file/releases/latest/download/willyhorizont.auto-install-vscode-extensions-for-opened-file.vsix

# Install to VS Code
code --install-extension willyhorizont.auto-install-vscode-extensions-for-opened-file.vsix
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
        },
        {
            "id": "vim-script",
            "file_extension": ".vim",
            "vscode_extensions": [
                // vscode extension not in marketplace? no problem, we can install them from remote url or local path
                "https://github.com/willyhorizont/vim9script-vscode-syntax-highlighter-extension/releases/latest/download/willyhorizont.vim9script-vscode-syntax-highlighter-extension.vsix",
                "http://randomweb.xyz/download/nkta.imprv-batt.vsix",
                "C:\\Users\\Willy Horizont\\Downloads\\some-ext.vsix",
                "~/Downloads/some-other-ext.vsix",
                "/home/user/Documents/another-ext.vsix",
            ],
        },
    ],
    "willyhorizont.github.io/auto-install-vscode-extensions-for-opened-file.base-vscode-extensions": [
        "formulahendry.code-runner"
    ],
    "willyhorizont.github.io/auto-install-vscode-extensions-for-opened-file.ignored-file-extensions": [
        ".js"
    ]
}
```
