// This test program sets up the BME688 sensor and data logging, constantly displays date and time on the OLED screen, logs data on Button A and transfers data on Button B
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.show("Logging", 4)
    for (let index = 0; index < 10; index++) {
        kitronik_air_quality.measureData()
        kitronik_air_quality.logData()
    }
    kitronik_air_quality.clearLine(4)
    kitronik_air_quality.show("Logging Complete!", 4)
    basic.pause(2000)
    kitronik_air_quality.clearLine(4)
})
input.onButtonPressed(Button.B, function () {
    kitronik_air_quality.sendAllData()
})
kitronik_air_quality.setDate(6, 9, 21)
kitronik_air_quality.setTime(0, 46, 0)
let statusLEDs = kitronik_air_quality.createAirQualityZIPDisplay()
kitronik_air_quality.addProjectInfo("My Name", "My Subject")
kitronik_air_quality.setupGasSensor()
kitronik_air_quality.calcBaselines()
statusLEDs.showColor(kitronik_air_quality.colors(ZipLedColors.Red))
basic.pause(2000)
statusLEDs.clear()
statusLEDs.show()
basic.forever(function () {
    kitronik_air_quality.show(kitronik_air_quality.readDate(), 1)
    kitronik_air_quality.show(kitronik_air_quality.readTime(), 2)
    statusLEDs.setZipLedColor(1, kitronik_air_quality.hueToRGB(Math.map(kitronik_air_quality.readTemperature(kitronik_air_quality.TemperatureUnitList.C), -10, 40, 0, 360)))
    statusLEDs.show()
})
