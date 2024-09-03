/**
 * Подробнее: https://developer.chrome.com/docs/extensions/reference/api/scripting
 *            https://sky.pro/wiki/html/izvlechenie-html-iskhodnika-stranitsy-s-chrome-rasshireniya/
 */

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
