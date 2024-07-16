const fs = require('fs');
const path = require('path');
const { ipcMain, shell, clipboard } = require('electron');
const { log } = require('./logger');

const pluginName = 'not_plugin_marketplace';

function getConfig(configPath) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

// 加载插件
function loadPlugin() {
    const pluginPath = LiteLoader.plugins[pluginName].path.data;

    // 默认配置
    const defaultConfig = {
        repositoryUrl:
            'https://mirror.ghproxy.com/https://raw.githubusercontent.com/LiteLoaderQQNT/Plugin-List/v4/plugins.json',
        remoteUrl:
            'https://mirror.ghproxy.com/https://raw.githubusercontent.com/{plugin}/{branch}/manifest.json',
        downloadUrl: 'https://mirror.ghproxy.com/{url}',
    };

    // 初始化配置
    const configPath = path.join(pluginPath, 'config.json');
    if (!fs.existsSync(pluginPath))
        fs.mkdirSync(pluginPath, { recursive: true });
    if (!fs.existsSync(configPath))
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));

    // 初始化通信
    ipcMain.handle(`LiteLoader.${pluginName}.setConfig`, (event, newConfig) => {
        try {
            fs.writeFileSync(configPath, JSON.stringify(newConfig), 'utf-8');
            return false;
        } catch (err) {
            console.error(err);
            return err;
        }
    });

    ipcMain.handle(`LiteLoader.${pluginName}.getConfig`, (event) => {
        try {
            return getConfig(configPath);
        } catch (err) {
            console.error(err);
            return { err };
        }
    });

    ipcMain.handle(`LiteLoader.${pluginName}.getClipboard`, (event) =>
        clipboard.readText()
    );

    ipcMain.handle(`LiteLoader.${pluginName}.openUrl`, (event, url) => {
        shell.openExternal(url);
    });

    // 获取插件列表
    ipcMain.handle(`LiteLoader.${pluginName}.getPluginList`, async (event) => {
        try {
            var { repositoryUrl } = getConfig(configPath);
            const pluginList = await (await fetch(repositoryUrl)).json();
            return { data: pluginList };
        } catch (err) {
            return { err };
        }
    });

    // 获取插件manifest
    ipcMain.handle(
        `LiteLoader.${pluginName}.getPluginManifest`,
        async (event, plugin, branch) => {
            try {
                var { remoteUrl } = getConfig(configPath);
                const pluginList = await (
                    await fetch(
                        remoteUrl
                            .replaceAll('{plugin}', plugin)
                            .replaceAll('{branch}', branch)
                    )
                ).json();
                return { data: pluginList };
            } catch (err) {
                return { err };
            }
        }
    );

    // 获取安装插件
    ipcMain.handle(
        `LiteLoader.${pluginName}.installPlugin`,
        (event, plugin, tag, file) => {
            // TODO: 安装插件
        }
    );
}

loadPlugin();

// 创建窗口时触发
module.exports.onBrowserWindowCreated = (window) => {
    // window 为 Electron 的 BrowserWindow 实例
};
