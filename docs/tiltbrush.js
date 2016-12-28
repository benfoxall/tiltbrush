(function (exports) {
'use strict';

const text = (int32) =>
  [0, 8, 16, 24].map(
    d => String.fromCharCode(0xff & (int32 >>> d))
  ).join('')


// https://gist.github.com/Plutor/2002457
// <3 THANKS JAVA <3



const values = Array.from({length: 32}, (_,x) => Math.pow(2, x))

const bits = i =>
  values.map( d => !! (i & d) )


class Reader {

  constructor (view, endian) {
    this.view = view
    this.i = 0
    this.endian = endian
  }

  skip (i) {
    console.log("skipping", i)
    this.i += i
  }

  getInt8() {
    const value = this.view.getInt8(this.i, this.endian)
    this.i += 1
    return value
  }

  getUint8() {
    const value = this.view.getUint8(this.i, this.endian)
    this.i += 1
    return value
  }

  getInt16() {
    const value = this.view.getInt16(this.i, this.endian)
    this.i += 2
    return value
  }

  getUint16() {
    const value = this.view.getUint16(this.i, this.endian)
    this.i += 2
    return value
  }

  getInt32() {
    const value = this.view.getInt32(this.i, this.endian)
    this.i += 4
    return value
  }

  getUint32() {
    const value = this.view.getUint32(this.i, this.endian)
    this.i += 4
    return value
  }

  getFloat32() {
    const value = this.view.getFloat32(this.i, this.endian)
    this.i += 4
    return value
  }

  getFloat64() {
    const value = this.view.getFloat64(this.i, this.endian)
    this.i += 8
    return value
  }

}

const decode = buffer => {

  const view = new DataView(buffer, 0)

  /*
    uint32 sentinel ('tilT')
    uint16 header_size (currently 16)
    uint16 header_version (currently 1)
    uint32 reserved
    uint32 reserved
  */


  const reader = new Reader(view, true)

  const header = {
    sentinel:       text(reader.getUint32()),
    header_size:    reader.getUint16(),
    header_version: reader.getUint16(),
    reserved_1:     reader.getUint32(),
    reserved_2:     reader.getUint32()
  }


  const zip = new JSZip()

  zip
    .loadAsync(buffer.slice(16))
    .then(zip => {
      console.log(zip)

      zip.file('thumbnail.png')
        .async('base64')
        .then(b => {
          // console.log(b)
          const img = new Image()
          img.src = 'data:image/png;base64,' + b
          // console.log(img)
          document.body.appendChild(img)
        })

      // zip.file('metadata.json')
      //   .async('text')
      //   .then(t => console.log(t))
      //

      zip.file('data.sketch')
        .async('arraybuffer')
        .then(sketch_buffer => {
          /*
            uint32 sentinel
            uint32 version
            uint32 reserved (must be 0)
            [ uint32 size + <size> bytes of additional header data ]
          */

          const view = new DataView(sketch_buffer, 0)
          const reader = new Reader(view, true)


          console.log(view.getUint32())
          console.log('sentinel', reader.getUint32())
          console.log('version', reader.getUint32())
          console.log('reserved', reader.getUint32())

          const size = reader.getUint32()
          // console.log('size', 0)

          reader.skip(size)

          // const skip = 16 + size

          const strokes = reader.getUint32()
          console.log("strokes", strokes)

          // let i = skip + 4

          /*
            int32 brush_index
            float32x4 brush_color
            float32 brush_size
            uint32 stroke_extension_mask
            uint32 controlpoint_extension_mask
            [ int32/float32              for each set bit in stroke_extension_mask &  ffff ]
            [ uint32 size + <size> bytes for each set bit in stroke_extension_mask & ~ffff ]
            int32 num_control_points
          */

          console.log('brush_index', reader.getInt32())
          console.log('brush_color', reader.getFloat32())
          console.log('brush_color', reader.getFloat32())
          console.log('brush_color', reader.getFloat32())
          console.log('brush_color', reader.getFloat32())
          console.log('brush_size',  reader.getFloat32())

          const stroke_ext = reader.getUint32()
          const ctrlpt_ext = reader.getUint32()

          console.log('stroke_ext', stroke_ext)
          console.log('ctrlpt_ext', ctrlpt_ext)

          // console.log(bits(reader.getUint32()))
          // console.log(bits(reader.getUint32()))
          //
          // var i = 0
          // i = i + 28
          //
          console.log(
            stroke_ext,
            bits(stroke_ext &  0xffff).map(x => x ? '1' : '0').join(''),
            bits(stroke_ext & !0xffff).map(x => x ? '1' : '0').join('')
          )

          bits(stroke_ext & 0xffff)
            .forEach(b => {
              if(b) reader.skip(4)
            })

          bits(stroke_ext & ~0xffff)
            .forEach(b => {
              if(b) reader.skip(reader.getUint32())
            })


          const num_points = reader.getUint32()

          console.log("POINTS", num_points)

          const skip = bits(ctrlpt_ext).reduce((a, b) => a + b, 0) * 4

          for(let i = 0; i < 10; i++) {
            const position = [
              reader.getFloat32(),
              reader.getFloat32(),
              reader.getFloat32()
            ]

            const orientation = [
              reader.getFloat32(),
              reader.getFloat32(),
              reader.getFloat32(),
              reader.getFloat32()
            ]

            console.log(position, orientation)

            reader.skip(skip)

          }


        })

    })

  console.log(header)
  return header
}


const read =
  path =>
    fetch(path)
      .then(res => res.arrayBuffer())
      .then(decode)

exports.read = read;

}((this.tiltbrush = this.tiltbrush || {})));
