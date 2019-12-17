class Server {
  constructor (document, operations) {
    this.document = document
    this.operations = operations || []
  }

  receiveOperation (revision, operation) {
    if (revision < 0 || this.operations.length < revision) {
      throw new Error('operation revision not in history')
    }
    var concurrentOperations = this.operations.slice(revision)

    var transform = operation.constructor.transform
    for (var i = 0; i < concurrentOperations.length; i++) {
      operation = transform(operation, concurrentOperations[i])[0]
    }

    this.document = operation.apply(this.document)
    this.operations.push(operation)
    return operation
  }
}

export default Server
