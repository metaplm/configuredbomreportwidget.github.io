const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/dist/plugin.js").default;
// VuetifyLoaderPlugin removed for Vue3 compatibility
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
    entry: ["babel-polyfill", "./src/lib/widget-starter.js"],
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../dist")
    },
    resolve: {
        alias: { }
    },
    module: {
        rules: [
            {
                test: /\.(svg|eot|woff|ttf|svg|woff2)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "static/fonts"
                        }
                    }
                ]
            },
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: [/node_modules/, /src\/static/],
                options: {
                    presets: ["@babel/env"]
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.s(c|a)ss$/,
                use: [
                    "vue-style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass"),
                            sassOptions: {
                                indentedSyntax: true // optional
                            }
                        }
                    }
                ]
            },
            {
                test: /\.md$/i,
                use: "raw-loader"
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "./src/index.html", to: "./index.html" },
                { from: "./src/static", to: "static", globOptions: { ignore: ["**/*.md"] } },
                { from: "./src/assets", to: "assets" }
            ]
        }),
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
        })
        // new BundleAnalyzerPlugin({
        //     analyzerMode: "server",
        //     generateStatsFile: true,
        //     statsOptions: { source: false }
        //   })
    ]
};
