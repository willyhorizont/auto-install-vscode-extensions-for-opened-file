const vscode = require("vscode");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const lJ = require(path.join(__dirname, "languages.json"));
const p = require(path.join(__dirname, "package.json"));

const extsIgnore = [
    ".txt",
    ".sh",
];

const lExtDict = lJ.reduce((cur, l) => {
    const cfX = l["file_extension"].toLowerCase();
    const lExts = l["vscode_extensions"].map((lExt) => lExt.toLowerCase());
    if (cur[cfX]) {
        cur[cfX] = [...cur[cfX], ...lExts];
        return cur;
    }
    cur[cfX] = lExts;
    return cur;
}, {});

const bP = path.join(__dirname, "vscode-extensions-base.txt");
const bExts = fs.existsSync(bP) ? fs.readFileSync(bP, "utf8").split(/\r?\n/).map((ln) => ln.trim().toLowerCase()).filter((ln) => ln.length > 0) : [];

const runCommand = (cmd) => {
    return new Promise((resolve) => {
        exec(cmd, (err) => {
            if (err) console.error(`Failed running command: ${cmd}`, err);
            resolve();
        });
    });
};

module.exports = { activate: (context) => {
    (async () => {
        for (const bExt of bExts) {
            if (!vscode.extensions.getExtension(bExt)) {
                await runCommand(`code --install-extension ${bExt} --force`);
                vscode.window.showInformationMessage(`Extension ${bExt} installed.`);
            }
        }
    })();

    let lfXs = []; 

    let dsp = vscode.window.onDidChangeActiveTextEditor(async (edt) => {
        if (!edt) return;

        const cfNm = edt.document.fileName;
        const cfX = path.extname(cfNm).toLowerCase();
        if (extsIgnore.includes(cfX)) return;
        const clExts = lExtDict?.[cfX] || [];

        if (clExts.length > 0) {
            if (lfXs.includes(cfX)) {
                lfXs = lfXs.filter((lfX) => lfX !== cfX);
            }
            lfXs.push(cfX);

            if (lfXs.length > 2) {
                const ofX = lfXs.shift();
                const olExts = lExtDict?.[ofX] || [];

                if (olExts.length > 0) {
                    for (const oExt of olExts) {
                        const insExt = oExt.toLowerCase();

                        if (bExts.includes(insExt)) continue;
                        if (lfXs.some((lfX) => lExtDict?.[lfX]?.map((lExt) => lExt.toLowerCase()).includes(insExt))) continue;

                        await runCommand(`code --uninstall-extension ${insExt} --force`);
                        vscode.window.showInformationMessage(`Extension ${insExt} uninstalled.`);
                    }
                }
            }

            for (const clExt of clExts) {
                if (!vscode.extensions.getExtension(clExt)) {
                    await runCommand(`code --install-extension ${clExt} --force`);
                    vscode.window.showInformationMessage(`Extension ${clExt} installed.`);
                }
            }
            return;
        }
    });
    context.subscriptions.push(dsp);
}, deactivate: () => undefined };
