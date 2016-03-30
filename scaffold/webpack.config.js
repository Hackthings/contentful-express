module.exports = {
    resolve: {
        root: __dirname
    },


    entry: {
        app: "./source/js/app.js"
    },


    output: {
        path: "./static/js/",
        filename: "app.js"
    },


    module: {
        loaders: [
            {
                test: /source\/js\/.*\.js$/,
                exclude: /node_modules|js_libs/,
                loader: "babel-loader"
            },

            {
                test: /(hobo|hobo.build)\.js$/,
                loader: "expose?hobo"
            }
        ]
    }
};