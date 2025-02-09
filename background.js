chrome.runtime.onInstalled.addListener(() => {
    // Remove todas as regras ao instalar a extensão
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: []
    });
  });
  