class Synchronized {
  applyClient (client, operation) {
    console.info('Synchronized.applyClient', client.revision, operation)
    client.sendOperation(client.revision, operation)
    return new AwaitingConfirm(operation)
  }
  applyServer (client, operation) {
    client.applyOperation(operation)
    return this
  }
  serverAck (client) {
    throw new Error('There is no pending operation.')
  }
  transformSelection (x) { return x }
}

class AwaitingWithBuffer {
  constructor (outstanding, buffer) {
    this.outstanding = outstanding
    this.buffer = buffer
  }

  applyClient (client, operation) {
    var newBuffer = this.buffer.compose(operation)
    return new AwaitingWithBuffer(this.outstanding, newBuffer)
  }

  applyServer (client, operation) {
    var transform = operation.constructor.transform
    var pair1 = transform(this.outstanding, operation)
    var pair2 = transform(this.buffer, pair1[1])
    client.applyOperation(pair2[1])
    return new AwaitingWithBuffer(pair1[0], pair2[0])
  }

  serverAck (client) {
    client.sendOperation(client.revision, this.buffer)
    return new AwaitingConfirm(this.buffer)
  }

  transformSelection (selection) {
    return selection.transform(this.outstanding).transform(this.buffer)
  }

  resend (client) {
    client.sendOperation(client.revision, this.outstanding)
  }
}

class AwaitingConfirm {
  constructor (outstanding) {
    this.outstanding = outstanding
  }

  applyClient (client, operation) {
    return new AwaitingWithBuffer(this.outstanding, operation)
  }

  applyServer (client, operation) {
    var pair = operation.constructor.transform(this.outstanding, operation)
    client.applyOperation(pair[1])
    return new AwaitingConfirm(pair[0])
  }

  serverAck (client) {
    console.log('AwaitingConfirm.serverAck', client)
    return synchronized_
  }

  transformSelection (selection) {
    return selection.transform(this.outstanding)
  }

  resend (client) {
    client.sendOperation(client.revision, this.outstanding)
  }
}

var synchronized_ = new Synchronized()

class Client {
  static AwaitingWithBuffer = AwaitingWithBuffer
  static Synchronized = Synchronized
  static AwaitingConfirm = AwaitingConfirm

  constructor (revision) {
    this.revision = revision // the next expected revision number
    this.state = synchronized_ // start state
  }

  setState (state) {
    this.state = state
  }

  // Call this method when the user changes the document.
  applyClient (operation) {
    console.info('Client.applyClient', operation)
    this.setState(this.state.applyClient(this, operation))
  }

  // Call this method with a new operation from the server
  applyServer (operation) {
    this.revision++
    this.setState(this.state.applyServer(this, operation))
  }

  serverAck () {
    this.revision++
    this.setState(this.state.serverAck(this))
  }

  serverReconnect () {
    if (typeof this.state.resend === 'function') { this.state.resend(this) }
  }

  transformSelection (selection) {
    return this.state.transformSelection(selection)
  }

  sendOperation (revision, operation) {
    throw new Error('sendOperation must be defined in child class')
  }

  applyOperation (operation) {
    throw new Error('applyOperation must be defined in child class')
  }
}

export default Client
