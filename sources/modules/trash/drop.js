mod.drop = function(input, option) {
    const drop = node => {
        if (ext.dom.trash_bin.contains(node))
            return;
        ext.dom.trash_bin.appendChild(node);
        node.style.height = '0px';
        mod.log('drop', node);
    }

    if (kk.is_s(input)) {
        each (document.querySelectorAll(input), drop);
        return;
    }

    if (kk.is_NL(input)) {
        each (input, drop);
        return;
    }

    if (kk.is_N(input)) {
        drop(input);
    }
}
