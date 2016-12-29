import {Reader, text, bits} from './help.js'

export class Sketch {

  constructor() {
    console.log("whoop!")

  }

  load(path) {
    this.loaded = fetch(path)
      .then(res => res.arrayBuffer())
      .then(this.decode.bind(this))
  }

  decode(buffer) {

    const view = new DataView(buffer, 0)
    const reader = new Reader(view, true)

    this.header = {
      sentinel:       text(reader.getUint32()),
      header_size:    reader.getUint16(),
      header_version: reader.getUint16(),
      reserved_1:     reader.getUint32(),
      reserved_2:     reader.getUint32()
    }

    this.zip = new JSZip()

    return this.zip.loadAsync(buffer.slice(16))

  }

  thumbnail() {
    return this.loaded
      .then( () => this.zip.file('thumbnail.png').async('base64') )
      .then( b => 'data:image/png;base64,' + b )
  }

  data() {
    return this.loaded
      .then( _ =>
        this.zip.file('data.sketch').async('arraybuffer')
      )
      .then( buffer => {
        const view = new DataView(buffer, 0)
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
  }

}
