import TextOperation from './text-operation'
import { EventEmitter } from 'events'
import WrappedOperation from './wrapped-operation'
import Server from './server'
import Selection from './selection'
// import util from 'util'

class EditorSocketIOServer extends Server {
  constructor (document, operations, docId, mayWrite) {
    super()
    EventEmitter.call(this)
    Server.call(this, document, operations)
    this.users = {}
    this.docId = docId
    // TODO: error
    // eslint-disable-next-line standard/no-callback-literal
    this.mayWrite = mayWrite || function (_, cb) { cb(true) }
  }

  addClient (socket) {
    var self = this
    socket
      .join(this.docId)
      .emit('doc', {
        str: this.document,
        revision: this.operations.length,
        clients: this.users
      })
      .on('operation', function (revision, operation, selection) {
        self.mayWrite(socket, function (mayWrite) {
          if (!mayWrite) {
            console.log("User doesn't have the right to edit.")
            return
          }
          self.onOperation(socket, revision, operation, selection)
        })
      })
      .on('selection', function (obj) {
        self.mayWrite(socket, function (mayWrite) {
          if (!mayWrite) {
            console.log("User doesn't have the right to edit.")
            return
          }
          self.updateSelection(socket, obj && Selection.fromJSON(obj))
        })
      })
      .on('disconnect', function () {
        console.log('Disconnect')
        socket.leave(self.docId)
        self.onDisconnect(socket)
        if (
          (socket.manager && socket.manager.sockets.clients(self.docId).length === 0) || // socket.io <= 0.9
          (socket.ns && Object.keys(socket.ns.connected).length === 0) // socket.io >= 1.0
        ) {
          self.emit('empty-room')
        }
      })
  }

  onOperation (socket, revision, operation, selection) {
    var wrapped
    try {
      wrapped = new WrappedOperation(
        TextOperation.fromJSON(operation),
        selection && Selection.fromJSON(selection)
      )
    } catch (exc) {
      console.error('Invalid operation received: ' + exc)
      return
    }

    try {
      var clientId = socket.id
      var wrappedPrime = this.receiveOperation(revision, wrapped)
      console.log('new operation: ' + JSON.stringify(wrapped))
      this.getClient(clientId).selection = wrappedPrime.meta
      socket.emit('ack')
      socket.broadcast['in'](this.docId).emit(
        'operation', clientId,
        wrappedPrime.wrapped.toJSON(), wrappedPrime.meta
      )
    } catch (exc) {
      console.error(exc)
    }
  }
  /**
   *
   * @param {*} socket
   * @param {Selection} selection
   */
  updateSelection (socket, selection) {
    var clientId = socket.id
    if (selection) {
      this.getClient(clientId).selection = selection
    } else {
      delete this.getClient(clientId).selection
    }
    socket.broadcast['in'](this.docId).emit('selection', clientId, selection)
  }

  setName (socket, name) {
    var clientId = socket.id
    this.getClient(clientId).name = name
    socket.broadcast['in'](this.docId).emit('set_name', clientId, name)
  }

  getClient (clientId) {
    return this.users[clientId] || (this.users[clientId] = {})
  }

  onDisconnect (socket) {
    var clientId = socket.id
    delete this.users[clientId]
    socket.broadcast['in'](this.docId).emit('client_left', clientId)
  }
}

function extend (target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key]
    }
  }
}

// util.inherits(EditorSocketIOServer, Server)
extend(EditorSocketIOServer.prototype, EventEmitter.prototype)

export default EditorSocketIOServer
