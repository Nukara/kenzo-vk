'use strict'

var APP = angular.module('kenzo-vk', ['ngSanitize']);
APP.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

APP.controller('settings', function($scope) {

//console.log(chrome.runtime.getURL('_locales/' + chrome.i18n.getUILanguage() + '/messages.json'));

function get_messages() {
    var i18n = {};
    var args = [];

    for (var i = 0; i < arguments.length; i++ ) {
        args.push(arguments[i])
    }

    each (args, function (item) {
        var root = item[0];
        var branch = item[1];

        if (typeof root !== 'string')
            throw new Error('get_messages error 1');

        if (root in i18n)
            console.warn('переопределение');
        i18n[root] = {};

        if (branch instanceof Array) {
            each (branch, function(item) {
                if (typeof item !== 'string')
                    throw new Error('get_messages error 2');

                i18n[root][item] = chrome.i18n.getMessage('o__' + root + '__' + item);
            });
        } else if (item.length === 1) {
            i18n[root] = chrome.i18n.getMessage('o__' + root);
        } else
            throw new Error('get_messages error 3');
    });

    return i18n;
}

// Текст
var pre_i18n = get_messages(
    [
        'audio', [
            'header',
            'cache',
            'download_button',
            'separator',
            'separator__desc'
        ]
    ], [
        'debug', [
            'header',
            'styles',
            'log'
        ]
    ], [
        'download_button', [
            'simplified',
            'simplified__desc'
        ]
    ], [
        'filters', [
            'brackets',
            'square_brackets',
            'curly_brackets'
        ]
    ], [
        'info', [
            'changes',
            'in2006',
            'in2016',
            'beta'
        ]
    ], [
        'header'
    ], [
        'common'
    ], [
        'reset'
    ], [
        'scrobbler', [
            'header',
            'm4m',
            'm4m__desc',
            'name_filter'
        ]
    ], [
        'trash', [
            'header',
            'sidebar_ads',
            'potential_friends',
            'newsads',
            'promoted_posts',
            'group_recom',
            'profile_rate',
            'big_like',
            'user_reposts',
            'group_reposts'
        ]
    ], [
        'ui', [
            'header',
            'ids',
            'unrounding',
            'sidebar_button'
        ]
    ], [
        'video', [
            'header',
            'format_before_ext',
            'format_before_ext__desc'
        ]
    ]
);

function replace_links(text, link) {
    if (typeof text == 'string')
        return text.replace(/\*(.+?)\*/g, '<a class="a-link" href="' + link + '">$1</a>');
    else
        return text;
}
pre_i18n.info.beta = replace_links(pre_i18n.info.beta, 'https://vk.com/kenzovk');

// FIX: Убрать этот бред отсюда
function get_msg(name) { return chrome.i18n.getMessage('o__' + name) }
pre_i18n.audio.separators = [
    {
        char: get_msg('audio__separator__1'),
        desc: get_msg('audio__separator__1') + ' (' +
            get_msg('audio__separator__1__desc') + ')'
    },{
        char: get_msg('audio__separator__2'),
        desc: get_msg('audio__separator__2') + ' (' +
            get_msg('audio__separator__2__desc') + ')'
    },{
        char: get_msg('audio__separator__3'),
        desc: get_msg('audio__separator__3') + ' (' +
            get_msg('audio__separator__3__desc') + ')'
    }
]


$scope.i18n = pre_i18n;

$scope.Manifest = chrome.runtime.getManifest();

// Настройки
var watch_flag = false;
$scope.Options = {};
$scope.scrobbler = {
    auth_url: ext.modules.scrobbler.auth_url
}
$scope.ctrl = false;

function sync_model() {
    chrome.storage.sync.get(ext.default_options, function(items) {
        watch_flag = false;
        $scope.Options = items;
        $scope.$apply();
        watch_flag = true;
    });
}

sync_model();

$scope.$watch('Options', function() {
    (watch_flag) && chrome.storage.sync.set($scope.Options);
}, true);

$scope.defaults = function() {
    if (confirm('Вы действительно хотите сбросить настройки?')) {
        chrome.storage.sync.set(ext.default_options);
    }
}

$scope.clear_db = function() {
    chrome.storage.local.clear(function() {
        chrome.storage.local.get(function() {
            //mod.log(arguments);
        });

        alert('Очищено');
    });
}

chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === 'sync') {
        sync_model();
    }
});

// Токен
var token = window.location.href.match(/token=([\w\d]+)/) || false;
if (token)
    ext.modules.scrobbler.methods.auth.getSession(token[1]);

// Скрытые опции
document.addEventListener('keydown', function(event) {
    if (!$scope.ctrl && event.keyCode == 17) {
        $scope.ctrl = true;
        $scope.$apply();

//        console.log($scope.ctrl)
    }
});
document.addEventListener('keyup', function(event) {
    if ($scope.ctrl && event.keyCode == 17) {
        $scope.ctrl = false;
        $scope.$apply();

//        console.log($scope.ctrl)
    }
});

// title
//Настройки Kenzo VK
document.title = chrome.runtime.getManifest().name + ': ' + get_msg('header');

});
