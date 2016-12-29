export class Renderer {

  constructor() {

    const canvas = document.createElement('canvas')
    const size = Math.min(window.innerHeight,window.innerWidth)
    const ratio = window.devicePixelRatio || 1

    canvas.width = canvas.height = size * ratio
    canvas.style.width = canvas.style.height = size + 'px'

    document.body.appendChild(canvas)

    this.ctx = canvas.getContext('2d')

    this.ctx.translate(size*ratio/2,size*ratio/2)
    this.ctx.scale(15,15)

  }

  setData(data) {
    data.strokes.forEach( stroke => {
      this.ctx.fillStyle = 'rgba(' + stroke.brush_color.map(c => Math.floor(c * 255)).join(', ') + ')'

      stroke.points.forEach( point => {
        if(point.position[2] > 0)
        this.ctx.fillRect(
          point.position[0],
          -point.position[1],
          .1,.1
        )
      })

    })
  }

}
