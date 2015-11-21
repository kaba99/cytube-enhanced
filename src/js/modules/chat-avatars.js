window.cytubeEnhanced.addModule('chatAvatars', function (app) {
    //window.formatChatMessage = function (e, t) {
    //    (!e.meta || e.msgclass) && (e.meta = {
    //        addClass: e.msgclass,
    //        addClassToNameAndTimestamp: e.msgclass
    //    });
    //
    //    var avaimage = (findUserlistItem(e.username) != null) && (findUserlistItem(e.username).data('profile').image != "") && (app.userConfig.get('avatarsMode') != false);
    //    var avatarCssClasses = (app.userConfig.get('avatarsMode') == 'big' ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small');
    //    var a = e.username === t.name;
    //
    //    "server-whisper" === e.meta.addClass && (a = !0),
    //    e.msg.match(/^\s*<strong>\w+\s*:\s*<\/strong>\s*/) && (a = !1),
    //    e.meta.forceShowName && (a = !1),
    //        e.msg = execEmotes(e.msg),
    //        t.name = e.username;
    //    var s = $("<div/>");
    //    if ("drink" === e.meta.addClass && (s.addClass("drink"),
    //            e.meta.addClass = ""),
    //            USEROPTS.show_timestamps) {
    //        var n = $("<span/>").addClass("timestamp").appendTo(s)
    //            , o = new Date(e.time).toTimeString().split(" ")[0];
    //        n.text("[" + o + "] "),
    //        e.meta.addClass && e.meta.addClassToNameAndTimestamp && n.addClass(e.meta.addClass)
    //    }
    //    var i = $("<span/>");
    //    a || i.appendTo(s);
    //    if (avaimage) { $("<img>").attr("src", findUserlistItem(e.username).data('profile').image).addClass(avatarCssClasses).appendTo(i)};
    //    $("<strong/>").addClass("username").text(e.username + ": ").appendTo(i),
    //    e.meta.modflair && i.addClass(getNameColor(e.meta.modflair)),
    //    e.meta.addClass && e.meta.addClassToNameAndTimestamp && i.addClass(e.meta.addClass),
    //    e.meta.superadminflair && (i.addClass("label").addClass(e.meta.superadminflair.labelclass),
    //        $("<span/>").addClass(e.meta.superadminflair.icon).addClass("glyphicon").css("margin-right", "3px").prependTo(i));
    //    var r = $("<span/>").appendTo(s);
    //    return r[0].innerHTML = e.msg,
    //    e.meta.action && (i.remove(),
    //        r[0].innerHTML = e.username + " " + e.msg),
    //    e.meta.addClass && r.addClass(e.meta.addClass),
    //    e.meta.shadow && s.addClass("chat-shadow"),
    //        s.find("img").load(function() {
    //                SCROLLCHAT && scrollChat()
    //            }
    //        ),
    //        s
    //};


    window.formatChatMessage = (function (oldFormatChatMessage) {
        return function (data, last) {
            var div = oldFormatChatMessage(data, last);

            var avatarCssClasses = (app.userConfig.get('avatarsMode') == 'big' ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small');

            if ((window.findUserlistItem(e.username) != null) && (window.findUserlistItem(e.username).data('profile').image != "") && (app.userConfig.get('avatarsMode') != false)) {
                $("<img>").attr("src", window.findUserlistItem(e.username).data('profile').image)
                    .addClass(avatarCssClasses)
                    .prependTo(div.find('.username').parent())
            }

            return div;
        };
    })(window.formatChatMessage);
});