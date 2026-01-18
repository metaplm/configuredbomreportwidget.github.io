const cfg = {
    urls: {
        // URL to serve from webpack (local)
        local: "https://dev.metaplm.com:8894/bomwidget/",

        // URL to access this server (public) - production URL kullan
        public: "https://dev.metaplm.com:8894/bomwidget/"
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
                    key: "/home/mirac/work/certificates/serverkey.key",
                    cert: "/home/mirac/work/certificates/servercert.crt"
                }
            },
            host: "0.0.0.0",
            port: 8894,
            devMiddleware: {
                publicPath: "/bomwidget/"
            },
        }
    }
};

module.exports = cfg;
