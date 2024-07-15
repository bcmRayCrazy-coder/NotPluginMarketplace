const pluginPath = LiteLoader.plugins['not_plugin_marketplace'].path.plugin;

// 防抖
function debounce(fn, time) {
    let timer;
    return function (...args) {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, time);
    };
}

// 设置
export const onSettingWindowCreated = async (view) => {
    view.innerHTML = await (
        await fetch(`local:///${pluginPath}/static/settings.html`)
    ).text();

    var config = await llnpm.getConfig();
    if (config.err) return alert('获取配置错误:\n', config.err);

    const remoteUrlInput = view.querySelector('#remote_url');
    remoteUrlInput.addEventListener(
        'input',
        debounce(async ({ target: { value: newRemote } }) => {
            config.remoteUrl = newRemote;
            console.log('Config set to', config);
            const err = await llnpm.setConfig(config);
            if (err) alert('更新配置错误:\n' + err);
        }, 500)
    );
    remoteUrlInput.addEventListener(
        'blur',
        async ({ target: { value: newRemote } }) => {
            if (!new RegExp(/^(http|https):\/\/(S+)$/).test(newRemote))
                alert('请输入网址');
        }
    );

    remoteUrlInput.value = config.remoteUrl;

    view.querySelector('#paste_remote').addEventListener('click', async () => {
        const clipboard = await llnpm.getClipboard();
        if (!new RegExp(/^(http|https):\/\/(S+)$/).test(clipboard))
            return alert('请粘贴网址');
        remoteUrlInput.value = clipboard;
    });
    view.querySelector('#open_remote').addEventListener('click', () =>
        llnpm.openUrl(llnpm.getConfig().remote)
    );
    view.querySelector('#open_project').addEventListener('click', () =>
        llnpm.openUrl(
            'https://github.com/bcmRayCrazy-coder/NotPluginMarketplace'
        )
    );
};
