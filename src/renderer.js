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
    return `<div class="item"><div class="content"><div class="info"><img src="${image}" alt="" /><div><setting-text class="title">${title}</setting-text><setting-text data-type="secondary" class="version" >${version}</setting-text ></div></div><p data-type="secondary" class="description" >${description}</p></div><div class="action"><setting-button id="view" data-plugin="${plugin}">查看</setting-button><setting-button id="install" data-plugin="${plugin}">安装</setting-button></div></div>`;
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

    async function updatePage(data, start) {
        const pluginListElement = view.querySelector('#plugin_list');
        pluginListElement.innerHTML = '';
        const tip = view.querySelector('#tip');
        if (data.length <= 0) {
            tip.innerText = '啥也没找到';
            return;
        } else {
            tip.innerText = '';
        }

        data.slice(start * 10, start * 10 + 10).forEach(
            async ({ repo, branch }) => {
                const { data: manifest, err } = await llnpm.getPluginManifest(
                    repo,
                    branch
                );

                if (err) return alert('出现错误:', err);
                if (manifest.version < 4) return;

                pluginListElement.innerHTML += getPluginElement(
                    repo,
                    manifest.name,
                    manifest.version,
                    manifest.description,
                    manifest.icon
                        ? `https://raw.githubusercontent.com/${repo}/${branch}/${manifest.icon}`
                        : ''
                );

                pluginListElement.querySelectorAll('#view').forEach((viewBtn) =>
                    viewBtn.addEventListener('click', ({ target }) => {
                        llnpm.openUrl(
                            'https://github.com/' + target.dataset.plugin
                        );
                    })
                );
            }
        );
    }

    async function initPluginList() {
        const tip = view.querySelector('#tip');
        const pageSelector = view.querySelector('#page_select');

        pageSelector.innerHTML = '';

        const { data, err } = await llnpm.getPluginList();
        if (err) {
            tip.innerText = '无法获取插件列表:\n' + pluginList.err;
            return;
        }
        tip.innerText = '加载中';

        updatePage(data, 0);
        for (let i = 0; i < data.length / 10; i++) {
            pageSelector.innerHTML += `<setting-option data-value="${i}">${
                i + 1
            }</setting-option>`;
        }
        pageSelector.addEventListener('selected', ({ detail: { value } }) => {
            console.log(value);
            updatePage(data, parseInt(value));
        });
    }

    initUrlInput('repository', 'repositoryUrl');
    initUrlInput('remote', 'remoteUrl');
    initUrlInput('download', 'downloadUrl');

    view.querySelector('#open_project').addEventListener('click', () =>
        llnpm.openUrl(
            'https://github.com/bcmRayCrazy-coder/NotPluginMarketplace'
        )
    );

    initPluginList();
};
