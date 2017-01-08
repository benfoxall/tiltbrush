
export const text = (int32) =>
  [0, 8, 16, 24].map(
    d => String.fromCharCode(0xff & (int32 >>> d))
  ).join('')


// https://gist.github.com/Plutor/2002457
// <3 THANKS JAVA <3
export const bitCount = i => {
  i = i - ((i >>> 1) & 0x55555555)
  i = (i & 0x33333333) + ((i >>> 2) & 0x33333333)
  i = (i + (i >>> 4)) & 0x0f0f0f0f
  i = i + (i >>> 8)
  i = i + (i >>> 16)
  return i & 0x3f
}


const values = Array.from({length: 32}, (_,x) => Math.pow(2, x))

export const bits = i =>
  values.map( d => !! (i & d) )

export const range = n =>
  Array.from({length: n}, (_, i) => i)


export class Reader {

  constructor (view, endian) {
    this.view = view
    this.cursor = 0
    this.endian = endian
  }

  skip (i) {
    this.cursor += i
  }

  getInt8() {
    const value = this.view.getInt8(this.cursor, this.endian)
    this.cursor += 1
    return value
  }

  getUint8() {
    const value = this.view.getUint8(this.cursor, this.endian)
    this.cursor += 1
    return value
  }

  getInt16() {
    const value = this.view.getInt16(this.cursor, this.endian)
    this.cursor += 2
    return value
  }

  getUint16() {
    const value = this.view.getUint16(this.cursor, this.endian)
    this.cursor += 2
    return value
  }

  getInt32() {
    const value = this.view.getInt32(this.cursor, this.endian)
    this.cursor += 4
    return value
  }

  getUint32() {
    const value = this.view.getUint32(this.cursor, this.endian)
    this.cursor += 4
    return value
  }

  getFloat32() {
    const value = this.view.getFloat32(this.cursor, this.endian)
    this.cursor += 4
    return value
  }

  getFloat64() {
    const value = this.view.getFloat64(this.cursor, this.endian)
    this.cursor += 8
    return value
  }

}
