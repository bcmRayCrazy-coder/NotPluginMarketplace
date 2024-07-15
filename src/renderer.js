const pluginPath = LiteLoader.plugins['not_plugin_marketplace'].path.plugin;

// 设置
export const onSettingWindowCreated = async (view) => {
    view.innerHTML = await (
        await fetch(`local:///${pluginPath}/static/settings.html`)
    ).text();
};
