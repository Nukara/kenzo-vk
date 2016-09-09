core.utils.local_console = (object, prefix) => {
    if (!kk.is_o(object) || !kk.is_s(prefix))
        throw kk.msg.ia;

    prefix += ' (' + core.s + ') —';

    const add_prefix = args => {
        args = Array.prototype.slice.call(args);
        args.unshift(prefix);
        return args;
    }

    each (['log', 'info', 'warn', 'error'], method => {
        object[method] = function() {
            if (ext.options && !ext.options.debug__log)
                return;

            console[method].apply(this, add_prefix(arguments));
        }
    });

//    object.flood = function() {
//        if (ext.options && !ext.options.debug__flood)
//            return;
//
//        console.log.apply(this, add_prefix(arguments));
//    }
}