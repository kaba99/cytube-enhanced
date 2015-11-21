window.cytubeEnhanced.addModule('chatAvatars', function (app) {
    window.formatChatMessage = function (e, t) {
        (!e.meta || e.msgclass) && (e.meta = {
            addClass: e.msgclass,
            addClassToNameAndTimestamp: e.msgclass
        });

        var avaimage = (findUserlistItem(e.username) != null) && (findUserlistItem(e.username).data('profile').image != "") && (app.userConfig.get('avatarsMode') != false);
        var avatarCssClasses = (app.userConfig.get('avatarsMode') == 'big' ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small');
        var a = e.username === t.name;

        "server-whisper" === e.meta.addClass && (a = !0),
        e.msg.match(/^\s*<strong>\w+\s*:\s*<\/strong>\s*/) && (a = !1),
        e.meta.forceShowName && (a = !1),
            e.msg = execEmotes(e.msg),
            t.name = e.username;
        var s = $("<div/>");
        if ("drink" === e.meta.addClass && (s.addClass("drink"),
                e.meta.addClass = ""),
                USEROPTS.show_timestamps) {
            var n = $("<span/>").addClass("timestamp").appendTo(s)
                , o = new Date(e.time).toTimeString().split(" ")[0];
            n.text("[" + o + "] "),
            e.meta.addClass && e.meta.addClassToNameAndTimestamp && n.addClass(e.meta.addClass)
        }
        var i = $("<span/>");
        a || i.appendTo(s);
        if (avaimage) { $("<img>").attr("src", findUserlistItem(e.username).data('profile').image).addClass(avatarCssClasses).appendTo(i)};
        $("<strong/>").addClass("username").text(e.username + ": ").appendTo(i),
        e.meta.modflair && i.addClass(getNameColor(e.meta.modflair)),
        e.meta.addClass && e.meta.addClassToNameAndTimestamp && i.addClass(e.meta.addClass),
        e.meta.superadminflair && (i.addClass("label").addClass(e.meta.superadminflair.labelclass),
            $("<span/>").addClass(e.meta.superadminflair.icon).addClass("glyphicon").css("margin-right", "3px").prependTo(i));
        var r = $("<span/>").appendTo(s);
        return r[0].innerHTML = e.msg,
        e.meta.action && (i.remove(),
            r[0].innerHTML = e.username + " " + e.msg),
        e.meta.addClass && r.addClass(e.meta.addClass),
        e.meta.shadow && s.addClass("chat-shadow"),
            s.find("img").load(function() {
                    SCROLLCHAT && scrollChat()
                }
            ),
            s
    };



    window.addUserDropdown = function (e) {
        var t = e.data("name")
            , a = (e.data("rank"),
            e.data("leader"))
            , s = e.data("meta") || {};
        e.find(".user-dropdown").remove();
        var n = $("<div/>").addClass("user-dropdown").appendTo(e).hide();
        $("<strong/>").text(t).appendTo(n).click(function() { $(chatline).val(t+": "+$(chatline).val())  });
        $("<br/>").appendTo(n);
        var o = $("<div/>").addClass("btn-group-vertical").appendTo(n)
            , i = $("<button/>").addClass("btn btn-xs btn-default").appendTo(o).click(function() {
                -1 == IGNORED.indexOf(t) ? (i.text("Unignore User"),
                    IGNORED.push(t)) : (i.text("Ignore User"),
                    IGNORED.splice(IGNORED.indexOf(t), 1))
            }
        );
        if (-1 == IGNORED.indexOf(t) ? i.text("Ignore User") : i.text("Unignore User"),
            t !== CLIENT.name) {
            $("<button/>").addClass("btn btn-xs btn-default").text("Private Message").appendTo(o).click(function() {
                    initPm(t).find(".panel-heading").click(),
                        n.hide()
                }
            )
        }
        if (hasPermission("leaderctl")) {
            var r = $("<button/>").addClass("btn btn-xs btn-default").appendTo(o);
            a ? (r.text("Remove Leader"),
                r.click(function() {
                        socket.emit("assignLeader", {
                            name: ""
                        })
                    }
                )) : (r.text("Give Leader"),
                r.click(function() {
                        socket.emit("assignLeader", {
                            name: t
                        })
                    }
                ))
        }
        if (hasPermission("kick") && $("<button/>").addClass("btn btn-xs btn-default").text("Kick").click(function() {
                    var e = prompt("Enter kick reason (optional)");
                    null  !== e && socket.emit("chatMsg", {
                        msg: "/kick " + t + " " + e,
                        meta: {}
                    })
                }
            ).appendTo(o),
                hasPermission("mute")) {
            var l = $("<button/>").addClass("btn btn-xs btn-default").text("Mute").click(function() {
                    socket.emit("chatMsg", {
                        msg: "/mute " + t,
                        meta: {}
                    })
                }
            ).appendTo(o)
                , d = $("<button/>").addClass("btn btn-xs btn-default").text("Shadow Mute").click(function() {
                    socket.emit("chatMsg", {
                        msg: "/smute " + t,
                        meta: {}
                    })
                }
            ).appendTo(o)
                , p = $("<button/>").addClass("btn btn-xs btn-default").text("Unmute").click(function() {
                    socket.emit("chatMsg", {
                        msg: "/unmute " + t,
                        meta: {}
                    })
                }
            ).appendTo(o);
            s.muted ? (l.hide(),
                d.hide()) : p.hide()
        }
        hasPermission("ban") && ($("<button/>").addClass("btn btn-xs btn-default").text("Name Ban").click(function() {
                var e = prompt("Enter ban reason (optional)");
                null  !== e && socket.emit("chatMsg", {
                    msg: "/ban " + t + " " + e,
                    meta: {}
                })
            }
        ).appendTo(o),
            $("<button/>").addClass("btn btn-xs btn-default").text("IP Ban").click(function() {
                    var e = prompt("Enter ban reason (optional)");
                    null  !== e && socket.emit("chatMsg", {
                        msg: "/ipban " + t + " " + e,
                        meta: {}
                    })
                }
            ).appendTo(o));
        var c = function(t) {
                return t.shiftKey ? !0 : (t.preventDefault(),
                    "none" == n.css("display") ? ($(".user-dropdown").hide(),
                        $(document).bind("mouseup.userlist-ddown", function(t) {
                                0 === n.has(t.target).length && 0 === e.parent().has(t.target).length && (n.hide(),
                                    $(document).unbind("mouseup.userlist-ddown"))
                            }
                        ),
                        n.show(),
                        n.css("top", e.position().top)) : n.hide(),
                    !1)
            }
            ;
        e.contextmenu(c),
            e.click(c)
    };
});