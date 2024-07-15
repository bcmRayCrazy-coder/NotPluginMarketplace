const { contextBridge, ipcRenderer } = require('electron');

const pluginName = 'not_plugin_marketplace';

contextBridge.exposeInMainWorld('llnpm', {
    setConfig: (content) =>
        ipcRenderer.invoke(`LiteLoader.${pluginName}.setConfig`, content),
    getConfig: (content) =>
        ipcRenderer.invoke(`LiteLoader.${pluginName}.getConfig`, content),
    openUrl: (content) =>
        ipcRenderer.invoke(`LiteLoader.${pluginName}.openUrl`, content),
    getClipboard: (content) =>
        ipcRenderer.invoke(`LiteLoader.${pluginName}.getClipboard`, content),
});
