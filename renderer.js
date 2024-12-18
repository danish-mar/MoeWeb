class Browser {
    constructor() {
        this.tabCounter = 1;
        this.currentTabId = 1;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Tab Management
        document.querySelector('.tab-add').addEventListener('click', () => this.addNewTab());
        document.getElementById('tabs-container').addEventListener('click', (e) => {
            const tabElement = e.target.closest('.tab');
            const tabCloseElement = e.target.closest('.tab-close');
            
            if (tabElement && !tabCloseElement) {
                this.switchToTab(tabElement.dataset.tabId);
            }
            
            if (tabCloseElement) {
                this.closeTab(tabElement.dataset.tabId);
            }
        });

        // Navigation Controls
        const navButtons = document.querySelectorAll('.nav-btn.back, .nav-btn.forward, .nav-btn.refresh');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const currentWebview = document.querySelector(`.tab-webview[data-tab-id="${this.currentTabId}"]`);
                
                if (btn.classList.contains('back')) currentWebview.goBack();
                if (btn.classList.contains('forward')) currentWebview.goForward();
                if (btn.classList.contains('refresh')) currentWebview.reload();
            });
        });

        // URL Bar
        const urlBar = document.querySelector('.url-bar');
        urlBar.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.navigateTo(urlBar.value);
            }
        });

        // Window Controls
        const windowControls = document.querySelectorAll('.window-control');
        windowControls.forEach(control => {
            control.addEventListener('click', (e) => {
                const action = control.classList.contains('close') ? 'close' :
                               control.classList.contains('minimize') ? 'minimize' :
                               'maximize';
                window.electronAPI.windowControl(action);
            });
        });
    }

    addNewTab(url = 'about:blank') {
        this.tabCounter++;
        const tabsContainer = document.getElementById('tabs-container');
        const webviewContainer = document.getElementById('webview-container');

        // Create Tab
        const newTab = document.createElement('div');
        newTab.classList.add('tab');
        newTab.dataset.tabId = this.tabCounter;
        newTab.innerHTML = `
            <span class="tab-title">New Tab</span>
            <span class="tab-close">&times;</span>
        `;

        // Create Webview
        const newWebview = document.createElement('webview');
        newWebview.classList.add('tab-webview');
        newWebview.dataset.tabId = this.tabCounter;
        newWebview.src = url;

        // Add event listeners to webview
        newWebview.addEventListener('did-start-loading', () => {
            const urlBar = document.querySelector('.url-bar');
            urlBar.value = newWebview.src || '';
        });

        newWebview.addEventListener('page-title-updated', (e) => {
            const tab = document.querySelector(`.tab[data-tab-id="${this.tabCounter}"]`);
            tab.querySelector('.tab-title').textContent = e.title;
        });

        // Add to DOM
        tabsContainer.insertBefore(newTab, document.querySelector('.tab-add'));
        webviewContainer.appendChild(newWebview);

        this.switchToTab(this.tabCounter);
    }

    switchToTab(tabId) {
        // Remove active class from current tab and webview
        document.querySelector('.tab.active')?.classList.remove('active');
        document.querySelector('.tab-webview.active')?.classList.remove('active');

        // Add active class to new tab and webview
        document.querySelector(`.tab[data-tab-id="${tabId}"]`).classList.add('active');
        document.querySelector(`.tab-webview[data-tab-id="${tabId}"]`).classList.add('active');

        this.currentTabId = parseInt(tabId);

        // Update URL bar
        const currentWebview = document.querySelector(`.tab-webview[data-tab-id="${tabId}"]`);
        const urlBar = document.querySelector('.url-bar');
        urlBar.value = currentWebview.src || '';
    }

    closeTab(tabId) {
        const tab = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
        const webview = document.querySelector(`.tab-webview[data-tab-id="${tabId}"]`);

        // If closing the last tab, add a new tab
        const tabs = document.querySelectorAll('.tab:not(.tab-add)');
        if (tabs.length <= 1) {
            this.addNewTab();
        }

        // If closing the current tab, switch to another
        if (parseInt(tabId) === this.currentTabId) {
            const remainingTabs = Array.from(tabs).filter(t => t.dataset.tabId !== tabId);
            if (remainingTabs.length > 0) {
                this.switchToTab(remainingTabs[0].dataset.tabId);
            }
        }

        // Remove tab and webview
        tab.remove();
        webview.remove();
    }

    navigateTo(url) {
        const currentWebview = document.querySelector(`.tab-webview[data-tab-id="${this.currentTabId}"]`);
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        currentWebview.loadURL(formattedUrl);
    }
}

// Initialize the browser when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.browser = new Browser();
    window.browser.addNewTab(); // Start with one tab
});