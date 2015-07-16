window.cytubeEnhanced = new CytubeEnhanced(
    $('title').text(),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.language || 'ru') : 'ru'),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.modulesSettings || {}) : {})
);
