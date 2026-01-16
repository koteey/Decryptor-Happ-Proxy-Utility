Java.perform(function() {
    var targetClass = "com.happproxy.util.ErrorCodeJNIWrapper";
    
    console.log("[📡] Запуск тотальной прослушки класса...");

    var hookInterval = setInterval(function() {
        try {
            var Wrapper = Java.use(targetClass);
            var methods = Wrapper.class.getDeclaredMethods();
            
            console.log("[🎯] Найдено методов для перехвата: " + methods.length);

            methods.forEach(function(method) {
                var methodName = method.getName();
                var overloads = Wrapper[methodName].overloads;

                overloads.forEach(function(overload) {
                    overload.implementation = function() {
                        // Собираем все входящие аргументы
                        var args = [];
                        for (var i = 0; i < arguments.length; i++) {
                            args.push(arguments[i]);
                        }

                        // Выполняем оригинальный метод
                        var result = this[methodName].apply(this, arguments);

                        // Выводим в лог вообще всё
                        console.log("\n[!] ВЫЗОВ МЕТОДА: " + methodName);
                        console.log(" Вход: " + JSON.stringify(args));
                        
                        if (result) {
                            var resStr = result.toString();
                            console.log(" Выход (длина " + resStr.length + "): " + resStr.substring(0, 100) + "...");
                            
                            // Если результат похож на Base64 с серверами
                            if (resStr.length > 100) {
                                try {
                                    var Base64 = Java.use("android.util.Base64");
                                    var decoded = Base64.decode(resStr, 0);
                                    var decodedStr = Java.use("java.lang.String").$new(decoded);
                                    if (decodedStr.toString().includes("vless://")) {
                                        console.log("\n🚀 НАЙДЕНО ВНУТРИ " + methodName + ":\n" + decodedStr.toString());
                                    }
                                } catch(e) {}
                            }
                        }
                        return result;
                    };
                });
            });

            console.log("[✅] ВСЕ МЕТОДЫ ПОД КОНТРОЛЕМ. Жми кнопки!");
            clearInterval(hookInterval);
        } catch (e) {
            // Ждем инициализации класса
        }
    }, 500);
});