const { contextBridge, ipcRenderer } = require('electron');

const pluginName = 'not_plugin_marketplace';
var exposeContent = {};

function addIpcInvoke(name) {
    exposeContent[name] = (...content) =>
        ipcRenderer.invoke(`LiteLoader.${pluginName}.${name}`, ...content);
}

addIpcInvoke('setConfig');
addIpcInvoke('getConfig');
addIpcInvoke('openUrl');
addIpcInvoke('getClipboard');
addIpcInvoke('getPluginList');
addIpcInvoke('getPluginManifest');
addIpcInvoke('installPlugin');

contextBridge.exposeInMainWorld('llnpm', exposeContent);
