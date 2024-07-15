const fs = require('fs');
const path = require('path');
const { log } = require('./logger');

// 加载插件
function loadPlugin() {
    const pluginPath = LiteLoader.plugins['not_plugin_marketplace'].path.data;

    // 默认配置
    const defaultConfig = {
        remoteUrl:
            'https://raw.githubusercontent.com/LiteLoaderQQNT/Plugin-List/v4/plugins.json',
    };
    const configPath = path.join(pluginPath, 'config.json');
    if (!fs.existsSync(pluginPath))
        fs.mkdirSync(pluginPath, { recursive: true });
    if (!fs.existsSync(configPath))
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
}

loadPlugin();

// 创建窗口时触发
module.exports.onBrowserWindowCreated = (window) => {
    // window 为 Electron 的 BrowserWindow 实例
};
