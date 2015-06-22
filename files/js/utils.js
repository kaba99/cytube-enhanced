animachEnhancedApp.addModule('utils', function () {
    $('#wrap').find('.navbar-fixed-top').removeClass('navbar-fixed-top');

    $('#messagebuffer').on('click', '.username', function() {
        $('#chatline').val($(this).text() + $("#chatline").val()).focus();
    });

    insertText = function (str) {
        $("#chatline").val($("#chatline").val()+str).focus();
    };
});
