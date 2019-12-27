<template>
  <div class="folder">
    <el-input v-model="nfile" placeholder=""></el-input>
    <el-button type="primary" @click="addfile">Add File</el-button>
    <el-button type="primary" @click="getfiles">Get Files</el-button>
    <li v-for="file in info" :key="file">
      <el-button type="success" @click="intoFile(file)">{{ file.fileName }}</el-button>
    </li>
  </div>
</template>

<script>
import axios from 'axios'
// import io from 'socket.io-client'
export default {
  data () {
    return {
      items: [
        { msg: 1 },
        { msg: 2 },
        { msg: 3 }
      ],
      info: null,
      nfile: null
      // path: 'http://localhost:3000'
    }
  },
  methods: {
    getfiles: function () {
      axios
        // .get('http://localhost:3000/api/files/getFiles')
        .get('/api/files/getFiles')
        .then(response => (this.info = response.data.files))
    },
    addfile: function () {
      // var data = {
      //   fileName: 'b.md'
      // }
      if (this.nfile == null) {
        alert('No file name')
      } else {
        axios
          // .put('http://localhost:3000/api/files/addFile', { fileName: this.nfile })
          .put('/api/files/addFile', { fileName: this.nfile })
          .then(response => this.getfiles())
      }
    },
    intoFile: function (file) {
      console.log(file)
      // alert(file.docId)
      // var io = require()
      // alert('how to do it?')
      // var token = sessionStorage.token
      // this.$socket = this.socket = io.connect('192.168.31.151:3000', {
      //   query: { docId: file.docId }
      // })
      // var socket = io.connect('localhost:3000', {
      //   query: { token: token, docId: file.docId }
      // })
      this.$router.push({ path: `/file/${file.docId}` })
    }
  },
  mounted () {
    console.log('mounted!')
    this.getfiles()
  }
}
</script>
