<template>
  <div class="folder">
    <input type="text"
           v-model="nfile"
           value=""/>
    <input type="button"
           value="Add File"
           @click="addfile"/>
    <input type="button"
           value="Get Files"
           @click="getfiles"/>
    <li v-for="file in info" :key="file">
      <button v-on:click="intoFile(file)">{{ file.fileName }}</button>
    </li>
  </div>
</template>

<script>
import axios from 'axios'
import io from 'socket.io-client'
export default {
  data () {
    return {
      items: [
        { msg: 1 },
        { msg: 2 },
        { msg: 3 }
      ],
      info: null,
      nfile: null,
      path: 'http://localhost:3000'
    }
  },
  methods: {
    getfiles: function () {
      axios
        .get('http://localhost:3000/api/files/getFiles')
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
          .put('http://localhost:3000/api/files/addFile', { fileName: this.nfile })
          .then(response => this.getfiles())
      }
    },
    intoFile: function (file) {
      console.log(file)
      // alert(file.docId)
      // var io = require()
      // alert('how to do it?')
      // var token = sessionStorage.token
      this.$socket = this.socket = io.connect('localhost:3000', {
        query: { docId: file.docId }
      })
      // var socket = io.connect('localhost:3000', {
      //   query: { token: token, docId: file.docId }
      // })
      this.$router.push({ path: '/' })
    }
  },
  mounted () {
    console.log('mounted!')
    this.getfiles()
  }
}
</script>
