import TextOperation from './text-operation'

class Range {
  static fromJSON (obj) {
    return new Range(obj.anchor, obj.head)
  }

  constructor (anchor, head) {
    this.anchor = anchor
    this.head = head
  }

  equals (other) {
    return this.anchor === other.anchor && this.head === other.head
  }

  isEmpty () {
    return this.anchor === this.head
  }

  transform (other) {
    function transformIndex (index) {
      var newIndex = index
      var ops = other.ops
      for (var i = 0, l = other.ops.length; i < l; i++) {
        if (TextOperation.isRetain(ops[i])) {
          index -= ops[i]
        } else if (TextOperation.isInsert(ops[i])) {
          newIndex += ops[i].length
        } else {
          newIndex -= Math.min(index, -ops[i])
          index += ops[i]
        }
        if (index < 0) { break }
      }
      return newIndex
    }

    var newAnchor = transformIndex(this.anchor)
    if (this.anchor === this.head) {
      return new Range(newAnchor, newAnchor)
    }
    return new Range(newAnchor, transformIndex(this.head))
  }
}

class Selection {
  static Range = Range

  static createCursor (position) {
    return new Selection([new Range(position, position)])
  }

  static fromJSON (obj) {
    var objRanges = obj.ranges || obj
    for (var i = 0, ranges = []; i < objRanges.length; i++) {
      ranges[i] = Range.fromJSON(objRanges[i])
    }
    return new Selection(ranges)
  }

  constructor (ranges) {
    this.ranges = ranges || []
  }

  equals (other) {
    if (this.position !== other.position) { return false }
    if (this.ranges.length !== other.ranges.length) { return false }
    // FIXME: Sort ranges before comparing them?
    for (var i = 0; i < this.ranges.length; i++) {
      if (!this.ranges[i].equals(other.ranges[i])) { return false }
    }
    return true
  }

  somethingSelected () {
    for (var i = 0; i < this.ranges.length; i++) {
      if (!this.ranges[i].isEmpty()) { return true }
    }
    return false
  }

  compose (other) {
    return other
  }

  transform (other) {
    for (var i = 0, newRanges = []; i < this.ranges.length; i++) {
      newRanges[i] = this.ranges[i].transform(other)
    }
    return new Selection(newRanges)
  }
}

export default Selection
