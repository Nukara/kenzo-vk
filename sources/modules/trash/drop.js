mod.drop = function(input, option) {
    var _ = function(node) {
        ext.dom.trash_bin.appendChild(node);
        node.style.height = '0px';
        mod.log('drop', node);
    }

    if (typeof input == 'string') {
        each (document.querySelectorAll(input), _);
    } else if (input instanceof NodeList) {
        each (input, _);
    } else if (input instanceof Node) {
        _(input);
    }
}