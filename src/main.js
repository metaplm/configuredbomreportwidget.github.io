import { x3DDashboardUtils } from "./lib/widget";
import { createApp } from "vue";
import App from "./components/app.vue";
import vuetify from "./plugins/vuetify";

function start() {
    x3DDashboardUtils.disableCSS(true);

    // add title to widget container
    window.title = "MetaPLM";
    widget.setTitle(window.title);

    const app = createApp(App);
    app.use(vuetify);
    
    // mount the Vue instance to the app defined in index.html
    app.mount("app");
}
/**
 * Entry point for both standalone & 3DDashboard modes
 */
export default function() {
    widget.addEvent("onLoad", () => {
        start();
    });
    widget.addEvent("onRefresh", () => {
        // any actions required on an application data refresh
        // ** avoid doing a window.location.href reload since that will wipe
        // out any prefrence updates
    });
}