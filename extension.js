const vscode = require("vscode");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const https = require("https");

let lfXs = [];
const processingExtensions = new Set();
let dS = null;
let globCtx = null;

const getIsVsix = (extS) => {
    const extSl = extS.toLowerCase();
    if (extSl.startsWith("http://") || extSl.startsWith("https://")) return true;
    if (extSl.endsWith(".vsix") || extSl.startsWith("~") || extSl.startsWith(".") || extSl.startsWith("/")) return true;
    if (/^[a-z]:/i.test(extSl) || extSl.startsWith("\\\\")) return true;
    return path.isAbsolute(extS);
};

const runCmd = (cmd) => {
    return new Promise((resolve) => {
        exec(cmd, (err) => {
            if (err) console.error(`Failed running command: ${cmd}`, err);
            resolve();
        });
    });
};

const svInstalledCache = (extId) => {
    if (globCtx) {
        const k = extId.toLowerCase();
        const cacheL = globCtx.globalState.get("installed_vsix_paths", []);
        if (!cacheL.includes(k)) {
            cacheL.push(k);
            globCtx.globalState.update("installed_vsix_paths", cacheL);
        }
    }
};

const installVsix = (vP) => {
    return new Promise((resolve) => {
        let rslvdP = vP;
        if (/%([^%]+)%/g.test(rslvdP)) {
            rslvdP = rslvdP.replace(/%([^%]+)%/g, (_, envVar) => {
                return process.env[envVar] || `%${envVar}%`;
            });
        }
        let nvP = rslvdP.replace(/\\/g, "/");
        if (nvP.startsWith("~")) {
            const clnSlc = rslvdP.substring(1).replace(/^[\\\/]+/, "");
            rslvdP = path.join(os.homedir(), clnSlc);
        } else {
            rslvdP = path.resolve(rslvdP);
        }
        if (fs.existsSync(rslvdP)) {
            runCmd(`code --install-extension "${rslvdP}" --force`).then(() => {
                svInstalledCache(vP);
                resolve();
            });
            return;
        }
        if (nvP.startsWith("http://") || nvP.startsWith("https://")) {
            const tempfP = path.join(os.tmpdir(), `temp-ext-${Date.now()}.vsix`);
            const fS = fs.createWriteStream(tempfP);
            const dl = (tarUrl) => {
                https.get(tarUrl, (rsp) => {
                    if (rsp.statusCode >= 300 && rsp.statusCode < 400 && rsp.headers.location) return dl(rsp.headers.location);
                    if (rsp.statusCode !== 200) {
                        console.error(`Failed to download VSIX from ${tarUrl}.`);
                        fS.close();
                        if (fs.existsSync(tempfP)) fs.unlinkSync(tempfP);
                        return resolve();
                    }
                    rsp.pipe(fS);
                    fS.on("finish", async () => {
                        fS.close();
                        await runCmd(`code --install-extension "${tempfP}" --force`);
                        if (fs.existsSync(tempfP)) fs.unlinkSync(tempfP);
                        svInstalledCache(vP);
                        resolve();
                    });
                }).on("error", (err) => {
                    console.error("Download stream error:", err);
                    fS.close();
                    if (fs.existsSync(tempfP)) fs.unlinkSync(tempfP);
                    resolve();
                });
            };
            dl(vP);
        } else {
            console.error(`Identifier "${vP}" is marked as VSIX target but file does not exist locally.`);
            resolve();
        }
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

const isVscExtInstalled = (extId) => {
    if (getIsVsix(extId)) {
        if (globCtx) {
            const cacheL = globCtx.globalState.get("installed_vsix_paths", []);
            if (cacheL.includes(extId.toLowerCase())) return true;
        }
        return false;
    }
    return !!vscode.extensions.getExtension(extId);
};

const rmvInstalledCache = (extId) => {
    if (globCtx) {
        const k = extId.toLowerCase();
        let cacheL = globCtx.globalState.get("installed_vsix_paths", []);
        if (cacheL.includes(k)) {
            cacheL = cacheL.filter((item) => item !== k);
            globCtx.globalState.update("installed_vsix_paths", cacheL);
        }
    }
};

module.exports = {
    activate: (ctx) => {
        globCtx = ctx;
        (async () => {
            const { bExts } = getDynamicConfig();
            for (const bExt of bExts) {
                const bExtL = bExt.toLowerCase();
                if (!isVscExtInstalled(bExtL) && !processingExtensions.has(bExtL)) {
                    processingExtensions.add(bExtL);
                    if (getIsVsix(bExtL)) {
                        await installVsix(bExt);
                    } else {
                        await runCmd(`code --install-extension ${bExtL} --force`);
                    }
                    processingExtensions.delete(bExtL);
                    vscode.window.showInformationMessage(`Extension ${bExt} processed.`);
                }
            }
        })();

        let dsp = vscode.window.onDidChangeActiveTextEditor(async (edt) => {
            if (!edt) return;

            if (dS) {
                clearTimeout(dS);
            }

            dS = setTimeout(async () => {
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
                                if (processingExtensions.has(insExt)) continue;
                                processingExtensions.add(insExt);

                                await runCmd(`code --uninstall-extension ${insExt} --force`);
                                rmvInstalledCache(oExt);
                                processingExtensions.delete(insExt);
                                vscode.window.showInformationMessage(`Extension ${insExt} uninstalled.`);
                            }
                        }
                    }

                    for (const clExt of clExts) {
                        const clInsExtL = clExt.toLowerCase();
                        if (!isVscExtInstalled(clInsExtL) && !processingExtensions.has(clInsExtL)) {
                            processingExtensions.add(clInsExtL);
                            if (getIsVsix(clInsExtL)) {
                                await installVsix(clExt);
                            } else {
                                await runCmd(`code --install-extension ${clInsExtL} --force`);
                            }
                            processingExtensions.delete(clInsExtL);
                            vscode.window.showInformationMessage(`Extension ${clExt} installed.`);
                        }
                    }
                }
            }, 500);
        });
        ctx.subscriptions.push(dsp);
    },
    deactivate: () => {
        if (dS) clearTimeout(dS);
    }
};
