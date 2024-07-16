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

// 生成插件元素
function getPluginElement(plugin, title, version, description, image) {
    return `<div class="item"><div class="content"><div class="info"><img src="${image}" alt="" /><div><setting-text class="title">${title}</setting-text><setting-text data-type="secondary" class="version" >${version}</setting-text ></div></div><setting-text data-type="secondary" class="description" >${description}</setting-text ></div><div class="action"><setting-button id="view" data-plugin="${plugin}">查看</setting-button><setting-button id="install" data-plugin="${plugin}">安装</setting-button></div></div>`;
}

// 更新插件列表
function updatePluginList(view, list = []) {
    const pluginList = view.querySelector('#plugin_list');
    pluginList.innerHTML = '';

    const tip = view.querySelector('#tip');
    if (list.length <= 0) {
        tip.innerText = '啥也没找到';
        return;
    } else {
        tip.innerText = '';
    }

    list.forEach(({ plugin, title, version, description, image }) => {
        pluginList.innerHTML += getPluginElement(
            plugin,
            title,
            version,
            description,
            image
        );
        pluginList
            .querySelectorAll('#view')
            .forEach((viewBtn) =>
                viewBtn.addEventListener(() => console.log(viewBtn))
            );
    });
}

// 设置
export const onSettingWindowCreated = async (view) => {
    view.innerHTML = await (
        await fetch(`local:///${pluginPath}/static/settings.html`)
    ).text();

    var config = await llnpm.getConfig();
    if (config.err) return alert('获取配置错误:\n', config.err);

    function initUrlInput(name, configKey) {
        const inputElement = view.querySelector(`#${name}_input`);
        inputElement.addEventListener(
            'input',
            debounce(async ({ target: { value } }) => {
                if (!new RegExp(filter).test(value)) return;
                config[configKey] = value;
                const err = await llnpm.setConfig(config);
                if (err) alert('更新配置错误:\n' + err);
            }, 500)
        );
        inputElement.addEventListener('blur', async ({ target: { value } }) => {
            if (!new RegExp(/^(http|https):\/\/(S+)$/).test(value))
                alert('请输入网址');
        });

        inputElement.value = config[configKey];

        view.querySelector('#paste_' + name).addEventListener(
            'click',
            async () => {
                const clipboard = await llnpm.getClipboard();
                if (!new RegExp(/^(http|https):\/\/(S+)$/).test(clipboard))
                    return alert('请粘贴网址');
                repositoryUrlInput.value = clipboard;
            }
        );
        view.querySelector('#open_' + name).addEventListener('click', () =>
            llnpm.openUrl(llnpm.getConfig().repositoryUrl)
        );
    }

    initUrlInput('repository','repositoryUrl');
    initUrlInput('remote','remoteUrl');
    initUrlInput('download','downloadUrl');

    view.querySelector('#open_project').addEventListener('click', () =>
        llnpm.openUrl(
            'https://github.com/bcmRayCrazy-coder/NotPluginMarketplace'
        )
    );
};
