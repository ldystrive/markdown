class SocketIOAdapter {
  constructor (socket, $socket) {
    this.socket = socket
    this.$socket = $socket

    console.log(socket)
    console.log($socket)

    var self = this
    socket.subscribe('client_left', function (clientId) {
      self.trigger('client_left', clientId)
    })
    socket.subscribe('set_name', function ([clientId, name]) {
      self.trigger('set_name', clientId, name)
    })
    socket.subscribe('ack', function () { self.trigger('ack') })
    socket.subscribe('operation', function ([clientId, operation, selection]) {
      console.log('SocketIOAdapter subscribe operation', clientId, operation, selection)
      self.trigger('operation', operation)
      self.trigger('selection', clientId, selection)
    })
    socket.subscribe('selection', function ([clientId, selection]) {
      self.trigger('selection', clientId, selection)
    })
    socket.subscribe('reconnect', function () {
      self.trigger('reconnect')
    })
  }

  sendOperation (revision, operation, selection) {
    console.log('SocketIOAdapter.sendOperation', revision, operation, selection)
    this.$socket.emit('operation', revision, operation, selection)
  }

  sendSelection (selection) {
    this.$socket.emit('selection', selection)
  }

  registerCallbacks (cb) {
    this.callbacks = cb
  }

  trigger (event) {
    var args = Array.prototype.slice.call(arguments, 1)
    var action = this.callbacks && this.callbacks[event]
    if (action) { action.apply(this, args) }
  }
}

export default SocketIOAdapter
