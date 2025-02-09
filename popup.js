document.addEventListener('DOMContentLoaded', function () {
    const addSiteBtn = document.getElementById('addSite');
    const blockSiteBtn = document.getElementById('blockSiteBtn');
    const siteInput = document.getElementById('siteInput');
    const siteList = document.getElementById('siteList');
    const clearAllBtn = document.getElementById('clearAll');
  
    let blockedSites = [];
  
    // Carregar sites bloqueados
    chrome.storage.local.get('blockedSites', function (result) {
      blockedSites = result.blockedSites || [];
      updateSiteList();
    });
  
    function updateSiteList() {
      siteList.innerHTML = '';
      blockedSites.forEach((site, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = site;
        const unblockBtn = document.createElement('button');
        unblockBtn.textContent = 'Desbloquear';
        unblockBtn.addEventListener('click', function () {
          removeBlockedSite(index);
        });
        listItem.appendChild(unblockBtn);
        siteList.appendChild(listItem);
      });
    }
  
    function saveSites() {
      chrome.storage.local.set({ blockedSites });
    }
  
    function removeBlockedSite(index) {
      const removedSite = blockedSites.splice(index, 1)[0];
      saveSites();
      updateSiteList();
      updateRules();
    }
  
    addSiteBtn.addEventListener('click', function () {
      const site = siteInput.value.trim();
      if (site && !blockedSites.includes(site)) {
        blockedSites.push(site);
        saveSites();
        updateSiteList();
        updateRules();
        siteInput.value = '';
      }
    });
  
    blockSiteBtn.addEventListener('click', function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;
        if (!blockedSites.includes(hostname)) {
          blockedSites.push(hostname);
          saveSites();
          updateSiteList();
          updateRules();
        }
      });
    });
  
    clearAllBtn.addEventListener('click', function () {
      blockedSites = [];
      saveSites();
      updateSiteList();
      updateRules();
    });
  
    function updateRules() {
      const rules = blockedSites.map((site, index) => ({
        id: index + 1,
        priority: 1,
        action: { type: "block" },
        condition: { urlFilter: `*://${site}/*`, resourceTypes: ["main_frame"] }
      }));
  
      // **Remover todas as regras antes de adicionar novas**
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: Array.from({ length: blockedSites.length + 10 }, (_, i) => i + 1),
        addRules: rules
      }, () => {
        console.log("Regras de bloqueio atualizadas.");
      });
    }
  });
  