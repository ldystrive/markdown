import Vue from 'vue'
import App from './App.vue'
import router from './router'

import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import VueMarkdown from 'vue-markdown'
// import VueSocketio from 'vue-socket.io'

Vue.use(VueCodemirror)
Vue.use(VueMarkdown)
// Vue.use(new VueSocketio({
//   debug: true,
//   connection: 'http://localhost:3000'
// }))

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
