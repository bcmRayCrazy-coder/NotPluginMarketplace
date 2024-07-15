const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("not_plugin_marketplace", {

});
