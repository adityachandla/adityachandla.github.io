const endpoint = "https://j0k3usty63.execute-api.us-east-1.amazonaws.com/stage/topLevel"
const delayMs = 1500
const urlField = document.getElementById("urlInput")
const button = document.getElementById("button-addon2")
const canvas = document.getElementById("myCanvas")

canvasWidth = canvas.width
canvasHeight = canvas.height

const ctx = canvas.getContext("2d")

sizeX = canvasWidth/4.9
sizeY = canvasHeight/9.8

levelHeight = sizeY*2

const rects = [
    {"X": sizeX, "Y": 0, "label": "Root node", "tag": 0}, 

    {"X": 0, "Y": levelHeight, "label": ".com node", "tag": 11},
    {"X": 2*sizeX, "Y": levelHeight, "label": ".org node", "tag": 12},

    {"X": sizeX, "Y": 2*levelHeight, "label": ".google node", "tag": 21},
    {"X": 3*sizeX, "Y": 2*levelHeight, "label": ".facebook node", "tag": 22},
]

setEnterListener()
drawScreen()

function drawRect(ctx, rect, color=null) {
    if (color === null) {
        ctx.rect(rect.X,rect.Y,sizeX, sizeY)
    } else {
        //console.log("Coloring ", color, rect)
        ctx.globalAlpha = 0.3
        ctx.fillStyle = color

        ctx.fillRect(rect.X, rect.Y, sizeX, sizeY)

        ctx.globalAlpha = 1
        ctx.fillStyle = "black"
    }
    ctx.fillText(rect.label, rect.X+15, rect.Y+30)
    ctx.stroke()
}

function redraw(ctx, rect) {
    //console.log("Recoloring ", rect)
    ctx.clearRect(rect.X, rect.Y, sizeX, sizeY)
    drawRect(ctx, rect)
}

async function pressFunc() {
    const url = urlField.value
    button.onclick = ""
    const responsePromise = getResponse(url)
    //console.log("Pressed with " + url)
    //Clear any existing colors
    for (const rect of rects) {
        redraw(ctx, rect)
    }
    //draw with new colors
    drawRect(ctx, rects[0], "blue")
    await delay(delayMs)
    const response = await responsePromise

    colorResponse(response)
    button.onclick = "pressFunc()"
}

async function colorResponse(response) {
    if (response.status === "REDIRECT") {
        colorRect(response.nodeId, "grey")
        colorRect(response.redirect.nodeId, "blue")
        await delay(delayMs)
        colorResponse(response.redirect)
    } else if (response.status === "FETCHED") {
        colorRect(response.nodeId, "green")
    } else if (response.status === "FAILED") {
        colorRect(response.nodeId, "red")
    } else {
        console.log("Something bad happened here")
    }
}

function colorRect(id, color) {
    const r = rects.filter(r => r.tag === id)[0]
    redraw(ctx, r)
    drawRect(ctx, r, color)
}

function setEnterListener() {
    urlField.addEventListener("keypress", function (ev) {
        if (ev.key === "Enter") {
            pressFunc()
        }
    })
}

function drawArrow(ctx, rect1, rect2) {
    startX = rect1.X+(sizeX/2)
    startY = rect1.Y+sizeY

    endX = rect2.X+(sizeX/2)
    endY = rect2.Y

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
}

function drawScreen() {
    ctx.font = "20px Arial"

    for (const rect of rects) {
        drawRect(ctx, rect)
    }

    drawArrow(ctx, rects[0], rects[1])
    drawArrow(ctx, rects[0], rects[2])
    drawArrow(ctx, rects[2], rects[3])
    drawArrow(ctx, rects[2], rects[4])
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function getResponse(url) {
    return fetch(endpoint, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({"url": url}),
    }).then((resp) => resp.json())
}
