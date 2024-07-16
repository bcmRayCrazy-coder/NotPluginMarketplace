const fs = require('fs');
const path = require('path');
const { ipcMain, shell, clipboard } = require('electron');
const { log } = require('./logger');

const pluginName = 'not_plugin_marketplace';

// 加载插件
function loadPlugin() {
    const pluginPath = LiteLoader.plugins[pluginName].path.data;

    // 默认配置
    const defaultConfig = {
        remoteUrl:
            'https://mirror.ghproxy.com/https://raw.githubusercontent.com/LiteLoaderQQNT/Plugin-List/v4/plugins.json',
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
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (err) {
            console.error(err);
            return { err };
        }
    });

    ipcMain.handle(`LiteLoader.${pluginName}.getClipboard`,(event)=>clipboard.readText());

    ipcMain.handle(`LiteLoader.${pluginName}.openUrl`, (event, url) => {
        shell.openExternal(url);
    });
}

loadPlugin();

// 创建窗口时触发
module.exports.onBrowserWindowCreated = (window) => {
    // window 为 Electron 的 BrowserWindow 实例
};
