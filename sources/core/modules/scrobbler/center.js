(function(kzvk){
'use strict';
//  – — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|

var mod = kzvk.modules.scrobbler;

mod.last_update_request__ts = 0;
mod.last_update_request__name = '';

mod.center = function(info){
    var expiration = 300000, // 1000 * 60 * (5 минут)
        acceptable_delay = 1500; // 1,5 секунды

    // Ограничение в 30 сек.
    if (info.duration < 30)
        return false;

    //console.log('mod.center:', info);

    function send_update_request(){
        var params = {
            artist: info.performer,
            track: info.title,
            duration: info.duration
        }

        // console.log('send_update_request', info);
        if (
            kenzo.ts() - mod.last_update_request__ts > 10000 ||
            info.name != mod.last_update_request__name
        ) {
            // FIX: если ошибка?
            mod.methods.track.updateNowPlaying(params, function(r){
                //console.log('request sended', r);
            });
            mod.last_update_request__ts = kenzo.ts();
            mod.last_update_request__name = info.name;
        }
    }

    function send_scrobble_request(first_update){
        var params = {
            artist: info.performer,
            track: info.title,
            timestamp: first_update,
            duration: info.duration
        }

        mod.methods.track.scrobble(params);
    }

    chrome.storage.local.get('scrobbler', function(storage){
        var buffer = storage.scrobbler.buffer,
            new_buffer = [],
            match = false;

        //console.log('---storage.scrobbler:', storage.scrobbler);

        // Актуализация буфера
        each (buffer, function(item){
            // Время с последнего обновления записи, мс
            var diff = kenzo.ts() - item.last_update;

            // Данная запись есть в буфере
            if (item.name === info.name){

                // Если прошло менее 1,5 с
                if (diff < acceptable_delay) {
                    // обновить и добавить разность к состоянию
                    item.last_update = kenzo.ts();
                    item.state += diff;

                    // Отправить информацию на last.fm
                    // TODO: ограничить частоту запросов
                    send_update_request();

                    // условия скробблинга
                    if (!item.scrobbled){
                        // Если проиграно 4 минуты
                        if (kzvk.options.scrobbler__4m && (item.state >= 240000)){
                            item.scrobbled = true; // FIX: а если ошибка? А если задержка?
                            send_scrobble_request(item.first_update);
                        } else {
                            var proportion = Math.round(item.state / item.duration * 100);

//                            console.log(
//                                'proportion:', proportion,
//                                'state:', Math.round(item.state / 1000)
//                            );

                            if (proportion >= kzvk.options.scrobbler__proportion){
                                item.scrobbled = true;
                                send_scrobble_request(item.first_update);
                            }
                        }
                    } else {
                        // Обнаружение заново включенного трека
                        if (info.current_time < item.last_position) {
                            item.scrobbled = false;
                            item.state = 0;
                            item.irst_update = Math.floor(kenzo.ts() / 1000);
                        }
                    }
                } else {
                    // просто обновить
                    item.last_update = kenzo.ts();
                }

                diff = 0;
                match = true;
                item.last_position = info.current_time;
            }

            // Проверка на срок годности
            if (diff < expiration){
                new_buffer.push(item);
            }
        });

        // Если запись новая
        if (!match) {
            new_buffer.push({
                id: info.id, // ключ аудиозаписи во вконтакте
                name: info.name, // полное наименование (исполнитель + название)
                duration: info.duration * 1000, //длительность трека, в мс
                state: 0, // прослушано, мс
                first_update: Math.floor(kenzo.ts() / 1000), // первое обновление,
                last_update: kenzo.ts(), // последнее обновление,
                last_position: info.current_time, // последняя позиция,
                scrobbled: false // заскробблен ли
            });
        }

        // Запись буфера в общее хранилище
        storage.scrobbler.buffer = new_buffer;
        chrome.storage.local.set(storage);

    });
}

})(kzvk);
