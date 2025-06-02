/**
 * Подробнее: https://developer.chrome.com/docs/extensions/reference/api/scripting
 *            https://sky.pro/wiki/html/izvlechenie-html-iskhodnika-stranitsy-s-chrome-rasshireniya/
 */

const lang = navigator.language;
const hotkeys_toggle = document.getElementById('hotkeys-toggle');
const lang_hotkeys_toggle = document.getElementById('lang-hotkeys-toggle');

if (lang !== 'ru') {
    document.getElementById('reload-btn').textContent = 'reload the page!';
    lang_hotkeys_toggle.textContent = 'disable youtube-hotkeys (0-9)';
}

/** Добавляем событие на кнопку плагина */
document.getElementById('reload-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        const currentTabId = tabs[0].id;
        const tabUrl = tabs[0].url;

        if (tabUrl.includes('youtube')) {
            chrome.scripting.executeScript({
                target: { tabId: currentTabId },
                func: parseTab,
                args: [ tabUrl ]
            }, response => callback(response, currentTabId))
        }

    });
});

/** Взаимодействуем с текущей вкладкой */
function parseTab(tabUrl) {
    const videoTime = document.querySelector('.ytp-time-current')?.textContent;
    // если мы находимся на вкладке с youtube-видео, получаем тайм-код видео
    if (videoTime) {
        let [hours, minutes, seconds] = videoTime.split(':').map(Number);
        if (!seconds) { [hours, minutes, seconds] = [0, hours, minutes] }
        const timeSeconds = (hours * 3600) + (minutes * 60) + seconds;
        return `${tabUrl.split('&')[0]}&t=${timeSeconds}s`;
    }
}

/** Коллбэк после выполнения парсинга - переоткрываем вкладку */
function callback(response, currentTabId) {
    const timedTabUrl = response[0].result;
    setTimeout(chrome.tabs.remove(currentTabId), 1000);
    chrome.tabs.create({ url: timedTabUrl });
}

/** Добавляем событие чекбокс против хоткеев */
hotkeys_toggle.addEventListener('change', () => {
    const ok_color = '#71f13b';
    const def_color = '#fff';

    lang_hotkeys_toggle.style.color = ok_color;
    setTimeout(() => { lang_hotkeys_toggle.style.color = def_color; }, 200)
});

/** перехват хоткеев */
window.addEventListener('keydown', (e) => {
    const hotkeys = ['0','1','2','3','4','5','6','7','8','9',0,1,2,3,4,5,6,7,8,9];
    if (hotkeys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
    }
}, true);