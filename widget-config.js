const cfg = {
    urls: {
        // URL to serve from webpack (local)
        local: "https://dev.metaplm.com:8895/configuredbomwidget/",

        // URL to access this server (public) - production URL kullan
        public: "https://dev.metaplm.com:8895/configuredbomwidget/"
    },
    backend: {
  
        // Execute Query Service - Ayarlanabilir backend adresi
        executeQueryService: "https://3dsearch25x.metaplm.com/federated/search?xrequestedwith=xmlhttprequest"
    },
    dev: {
        devServer: {
            server: {
                type: "https",
                options: {
                    key: "./certificates/serverkey.key",
                    cert: "./certificates/servercert.crt"
                }
            },
            host: "0.0.0.0",
            port: 8895,
            devMiddleware: {
                publicPath: "/configuredbomwidget/"
            },
            hot: true,
            liveReload: true,
            client: {
                overlay: true
            }
        }
    }
};

module.exports = cfg;
