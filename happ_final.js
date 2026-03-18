Java.perform(function() {
    console.log("[✅] обновите подписку"); 

    var MMKV = Java.use("com.tencent.mmkv.MMKV");
    var uniqueAddresses = new Set(); // Тут храним только адреса (IP/домен)
    var finalLinks = []; 
    var dumpTimer = null;

    function printFinal() {
        if (finalLinks.length === 0) return;
        console.log("\n" + "=".repeat(40));
        console.log(finalLinks.join("\n"));
        console.log("=".repeat(40));
        console.log("убрано дублей: " + (finalLinks.length - uniqueAddresses.size));
        // Очищаем для следующего раза
        uniqueAddresses.clear();
        finalLinks = [];
    }

    MMKV.decodeString.overloads.forEach(function(overload) {
        overload.implementation = function() {
            var res = this.decodeString.apply(this, arguments);
            if (res) {
                var s = res.toString();
                if (s.includes('"protocol"') && (s.includes('"vless"') || s.includes('"trojan"'))) {
                    try {
                        var j = JSON.parse(s);
                        var out = j.outboundBean || (j.fullConfig && j.fullConfig.outbounds ? j.fullConfig.outbounds[0] : null);
                        if (!out && j.protocol) out = j;

                        if (out) {
                            var addr = "";
                            var link = "";
                            var name = j.remarks || "Server";

                            if (out.protocol === "vless") {
                                var v = out.settings.vnext[0];
                                addr = v.address + ":" + v.port;
                                if (!uniqueAddresses.has(addr)) {
                                    var u = v.users[0];
                                    var st = out.streamSettings;
                                    var r = st.realitySettings;
                                    link = "vless://" + u.id + "@" + v.address + ":" + v.port + "?encryption=none&flow=" + (u.flow || "xtls-rprx-vision") + "&security=reality&sni=" + r.serverName + "&fp=" + (r.fingerprint || "chrome") + "&pbk=" + r.publicKey + "&sid=" + r.shortId + "&type=" + st.network + "#" + encodeURIComponent(name);
                                    uniqueAddresses.add(addr);
                                    finalLinks.push(link);
                                }
                            } else if (out.protocol === "trojan") {
                                var srv = out.settings.servers[0];
                                addr = srv.address + ":" + srv.port;
                                if (!uniqueAddresses.has(addr)) {
                                    link = "trojan://" + srv.password + "@" + srv.address + ":" + srv.port + "?security=tls&sni=" + (out.streamSettings.tlsSettings.serverName || srv.address) + "#" + encodeURIComponent(name);
                                    uniqueAddresses.add(addr);
                                    finalLinks.push(link);
                                }
                            }
                        }
                        if (dumpTimer) clearTimeout(dumpTimer);
                        dumpTimer = setTimeout(printFinal, 3000);
                    } catch (e) {}
                }
            }
            return res;
        };
    });
});