/*jslint node: true */
'use strict';

var getLoginStatus,
    login,

    FB = null;

window.FB = null;

window.fbAsyncInit = function() {
    window.FB.init({
        appId: '522375581240221',
        xfbml: true,
        version: 'v2.1'
    });

    FB = window.FB;
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = '//connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

getLoginStatus = function(callback) {
    var module = this;
    if (FB === null) {
        setTimeout(function() {
            module.getLoginStatus(callback);
        }, 10);
        return;
    }

    FB.getLoginStatus(callback);
};

login = function(callback, options) {
    var module = this;
    if (FB === null) {
        setTimeout(function() {
            module.login(callback, options);
        }, 10);
        return;
    }

    FB.login(callback, options);
};

module.exports = {
    getLoginStatus: getLoginStatus,
    login: login
};