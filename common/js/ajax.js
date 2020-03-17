(() => {
    const ajax = {
        get(url, headers) {
            fetch(url, headers || {}).then();
        },
        json(url, headers) {
            return fetch(url, headers || {}).then(e => e.json()).then(e => e);
        },
    };

    window.ajax = ajax;
})()