/*jslint node: true */
'use strict';

var WebPack = require('webpack'),
    IS_PRODUCTION = true,
    path = __dirname + '/build/';

if(IS_PRODUCTION === true) {
    path = path + 'production/';
}
else {
    path = path + 'development/';
}

module.exports = {
    entry: './main.js',
    output: {
        path: path,
        filename: 'bundle.js',
        publicPath: 'https://www.sharingear.com/'
    },
    module: {
        loaders: [{
            test: /\.json$/,
            loader: 'json'
        }, {
            test: /\.html$/,
            loader: 'html?attrs='
        }]
    },
    externals: {
        'googlemaps': 'google.maps'
    },
    plugins: [
        //Timezone data needs to be required via a loader
        //new WebPack.IgnorePlugin(/^\.\/data\/packed\/latest\.json$/, /moment-timezone$/)

        //Assign jQuery plugin to the global variable, for third party script compatibility
        new WebPack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],
    devtool: 'sourcemap'
};
