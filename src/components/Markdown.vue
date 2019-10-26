<template>
  <div id="container">
    <div id="content">
      <codemirror
        ref="myCm"
        :value="value"
        :options="cmOptions"
        @ready="onCmReady"
        @input="onCmCodeChange"
        @change="onChange"
        @changes="onChanges"
        @cursorActivity="onCursorActivity"
        @focus="onFocus"
        @blur="onBlur"
      >
      </codemirror>
    </div>
    <div id="preview">
      <div
        v-html="html"
        ref="previewInner"
      ></div>
    </div>
  </div>

</template>

<script>
// language js
// import 'codemirror/mode/javascript/javascript.js'
// theme css
import 'codemirror/theme/base16-dark.css'
// import VueMarkdown from 'vue-markdown'
import marked from 'marked'
import ot from '../ot'
// import ot from '../ot'

console.log('233333', ot)
// import '../ot/codemirror-adapter'
// import '../ot.js/codemirror-adapter'

// console.log(ot)
// import '../socket/socket'
// more codemirror resources
// import 'codemirror/some-resource...'
export default {
  data () {
    return {
      value: '# test',
      timeoutId: null,
      html: '',
      cmOptions: {
        // codemirror options
        tabSize: 4,
        // mode: 'text/javascript',
        theme: 'base16-dark',
        lineNumbers: true,
        line: true
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    }
  },
  components: {
    // VueMarkdown
  },
  methods: {
    onCmReady (cm) {
      console.log('the editor is readied!', cm)
    },
    onCmFocus (cm) {
      console.log('the editor is focus!', cm)
    },
    onCmCodeChange (newValue) {
      console.log('this is new value', newValue)
      this.value = newValue
    },
    onChange (cm) {
      console.log('change event')
    },
    onChanges (cm) {
      console.log('changes event', cm)
    },
    onCursorActivity (cm) {
      console.log('cursorActivity event')
    },
    onFocus (cm) {
      console.log('focus event')
    },
    onBlur (cm) {
      console.log('blur event')
    }
  },
  computed: {
    codemirror () {
      return this.$refs.myCm.codemirror
    }
  },
  mounted () {
    console.log('this is current codemirror object', this.codemirror)
    this.html = marked(this.value, {
      sanitize: false
    })

    console.log('socker', this.$socket, this.sockets)

    // console.log(ot)
    this.sockets.subscribe('doc', (data) => {
      console.log('socket on doc', data)
      var cm = this.codemirror
      cm.setValue(data.str)
      console.log('data', this.value)
      var editorAdapter = new ot.CodeMirrorAdapter(cm)
      var serverAdapter = new ot.SocketIOAdapter(this.sockets, this.$socket)

      var client = new ot.EditerClient(data.revision, data.clients, serverAdapter, editorAdapter)
      console.log('client', client)
    })
  },
  watch: {
    value () {
      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        this.html = marked(this.value, {
          sanitize: false
        })
      }, 30)
    }
  }
}
</script>

<style lang="less" scoped>
#container {
  display: flex;
  flex: 1;
  #content {
    width: 50%;
  }
  #preview {
    width: 50%;
  }
}
</style>
