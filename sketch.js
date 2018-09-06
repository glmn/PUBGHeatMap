let Telemetry
let SelectsWasChanged = true
let Map = {
  pixels: [[]],
  maxValue: 0
}

let Players = {
  positions: [],
  draw: {
    reset: () => {
      for (let x = 0; x < width; x++) {
        Map.pixels[x] = []
        for (let y = 0; y < height; y++) {
          Map.pixels[x][y] = 0
        }
      }
    },

    fireNeighbourCells: (_x, _y, r = 2) => {
      startX = _x - r
      startY = _y - r
      endX = _x + r
      endY = _y + r

      if (startX < 0) startX = 0
      if (startX > width) startX = width
      if (endX < 0) endX = 0
      if (endX > width) endx = width
      if (startY < 0) startY = 0
      if (startY > height) startY = height
      if (endY < 0) endY = 0
      if (endY > height) endy = height

      function makeCircle (centerX, centerY, r) {
        let x, y, d, yDiff, threshold, rSq
        r = (r * 2) + 1
        rSq = (r * r) / 4
        for (y = startY; y < endY; y++) {
          yDiff = y - centerY
          threshold = rSq - (yDiff * yDiff)
          for (x = startX; x < endX; x++) {
            d = x - centerX
            Map.pixels[x][y] += ((d * d) > threshold) ? 0 : 1
          }
        }
      }

      makeCircle(_x, _y, r)
    },

    positions: (radius) => {
      for (let i = 0; i < Players.positions.length; i++) {
        let x = Math.ceil(Players.positions[i].character.location.x / 408000 * width)
        let y = Math.ceil(Players.positions[i].character.location.y / 408000 * height)

        if (x < 0) x = 0
        if (y < 0) y = 0
        if (x > width) x = width
        if (y > height) y = height

        Map.pixels[x][y] += 1
        Players.draw.fireNeighbourCells(x, y, radius)
        if (Map.pixels[x][y] > Map.maxValue) { Map.maxValue = Map.pixels[x][y] }
      }
    }
  }
}

function SelectsChanged () {
  SelectsWasChanged = true
}

function preload () {
  mapImage = loadImage('Savage_Main.jpg')
  Telemetry = loadJSON('data.json')
}

function setup () {
  createCanvas(1080, 1080)
  colorMode(HSB, 360, 100, 100)
  Telemetry = Object.values(Telemetry)
  Players.positions = Telemetry.filter(data => data._T == 'LogPlayerPosition')
    .filter(data => data.common.isGame >= 1)

  hueFrom = createSlider(0, 360, 188).changed(SelectsChanged)
  hueTo = createSlider(0, 360, 0).changed(SelectsChanged)
  hueCut = createSlider(0, 360, 0).changed(SelectsChanged)
  heatOpacity = createSlider(0, 100, 42).changed(SelectsChanged)
  radius = createSlider(1, 50, 6).changed(SelectsChanged)

  Players.draw.reset()
  Players.draw.positions(radius.value())
}

function draw () {
  if (SelectsWasChanged == true) {
    background(51)
    image(mapImage, 0, 0, width, height)
    Players.draw.reset()
    Players.draw.positions(radius.value())
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (Map.pixels[x][y] == 0) { continue }
        let color = map(Map.pixels[x][y], 0, Map.maxValue, hueFrom.value(), hueTo.value())
        if (Map.pixels[x][y] > hueCut.value()) {
          stroke(color, 100, Map.pixels[x][y], parseFloat(heatOpacity.value()) / 100.0)
          strokeWeight(1)

          point(x, y)
        }
      }
    }
    SelectsWasChanged = false
  }
}
