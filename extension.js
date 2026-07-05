const vscode = require("vscode");
const { exec } = require("child_process");
const path = require("path");

let lfXs = [];

const runCmd = (cmd) => {
    return new Promise((resolve) => {
        exec(cmd, (err) => {
            if (err) console.error(`Failed running command: ${cmd}`, err);
            resolve();
        });
    });
};

const getDynamicConfig = () => {
    const c = vscode.workspace.getConfiguration("willyhorizont.github.io/auto-install-vscode-extensions-for-opened-file");
    const lJ = c.get("language-specific-vscode-extensions") || [];
    const bExts = (c.get("base-vscode-extensions") || []).map((ext) => ext.toLowerCase());
    const extsIgnore = (c.get("ignored-file-extensions") || []).map((ext) => ext.toLowerCase());
    const lExtDict = lJ.reduce((cur, l) => {
        if (!l["id"] || !l["file_extension"] || !l["vscode_extensions"]) return cur;
        const cfX = l["file_extension"].toLowerCase();
        const lExts = l["vscode_extensions"].map((lExt) => lExt.toLowerCase());
        if (cur[cfX]) {
            cur[cfX] = [...cur[cfX], ...lExts];
            return cur;
        }
        cur[cfX] = lExts;
        return cur;
    }, {});
    return { lExtDict, bExts, extsIgnore };
};

module.exports = {
    activate: (context) => {
        (async () => {
            const { bExts } = getDynamicConfig();
            for (const bExt of bExts) {
                if (!vscode.extensions.getExtension(bExt)) {
                    await runCmd(`code --install-extension ${bExt} --force`);
                    vscode.window.showInformationMessage(`Extension ${bExt} installed.`);
                }
            }
        })();

        let dsp = vscode.window.onDidChangeActiveTextEditor(async (edt) => {
            if (!edt) return;

            const cfNm = edt.document.fileName;
            const cfX = path.extname(cfNm).toLowerCase();
            const { lExtDict, bExts, extsIgnore } = getDynamicConfig();
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
                            if (lfXs.some((lfX) => lExtDict?.[lfX]?.includes(insExt))) continue;

                            await runCmd(`code --uninstall-extension ${insExt} --force`);
                            vscode.window.showInformationMessage(`Extension ${insExt} uninstalled.`);
                        }
                    }
                }

                for (const clExt of clExts) {
                    if (!vscode.extensions.getExtension(clExt)) {
                        await runCmd(`code --install-extension ${clExt} --force`);
                        vscode.window.showInformationMessage(`Extension ${clExt} installed.`);
                    }
                }
                return;
            }
        });
        context.subscriptions.push(dsp);
    },
    deactivate: () => undefined
};
