window.cytubeEnhanced = new CytubeEnhanced(
    $('title').text(),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.language || 'en') : 'en'),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.modulesSettings || {}) : {})
);
