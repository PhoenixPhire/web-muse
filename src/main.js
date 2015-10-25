import './main.scss';
import Vue from 'vue';

import App from './app.vue';

window.vm = new Vue({
  el: 'body',
  data: {},
  components: {
    app: App
  }
});
