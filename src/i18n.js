import Vue from 'vue';
import VueI18n from 'vue-i18n';

import en from './i18n/en.json';
import tr from './i18n/tr.json';
import de from './i18n/de.json';
import fr from './i18n/fr.json';
import es from './i18n/es.json';
import it from './i18n/it.json';
import nl from './i18n/nl.json';
import ru from './i18n/ru.json';
import zh from './i18n/zh.json';
import ar from './i18n/ar.json';

Vue.use(VueI18n);

const savedLocale = localStorage.getItem('locale') || 'en';

const i18n = new VueI18n({
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    tr,
    de,
    fr,
    es,
    it,
    nl,
    ru,
    zh,
    ar
  }
});

export default i18n;
