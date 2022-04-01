forever(() => {
    console.logValue("temp", modules.temperature1.temperature())
    console.logValue("airp", modules.airPressure1.pressure())
    console.logValue("humi", modules.humidity1.humidity())
    pause(1000)
})