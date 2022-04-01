
> Open this page at [https://kitronikltd.github.io/pxt-kitronik-air-quality/](https://kitronikltd.github.io/pxt-kitronik-air-quality/)

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/kitronikltd/pxt-kitronik-air-quality** and import

## ZIP LEDs
  
The ZIP LEDs section contains blocks for controlling the 3 onboard status LEDs.  
**Note:** Any block which does not have "show" in the name needs to be followed by a ``||kitronik_air_quality.show||`` block to make the changes visible.  
  
The first block sets up the ZIP LEDs as a variable, enabling them to be controlled in the program.  
```blocks
let statusLEDs = kitronik_air_quality.createAirQualityZIPDisplay()
```
  
To set the colour of all the ZIP LEDs (or a whole range), use the ``||kitronik_air_quality.set color||`` block. To view the changes there needs to be a ``||kitronik_air_quality.show||`` block after this block.  
```blocks
let statusLEDs: kitronik_air_quality.statusLEDs = null
statusLEDs.setColor(kitronik_air_quality.colors(ZipLedColors.Red))
```
  
To set the colour of all the ZIP LEDs (or a whole range) **and** then show the change, use the ``||kitronik_air_quality.show color||`` block.  
```blocks
let statusLEDs: kitronik_air_quality.statusLEDs = null
statusLEDs.showColor(kitronik_air_quality.colors(ZipLedColors.Red))
```
  
To set the colour of an individual LED, use the ``||kitronik_air_quality.set ZIP LED||`` block. To view the changes there needs to be a ``||kitronik_air_quality.show||`` block after this block.  
```blocks
let statusLEDs: kitronik_air_quality.statusLEDs = null
statusLEDs.setZipLedColor(1, kitronik_air_quality.colors(ZipLedColors.Green))
```
  
The ``||kitronik_air_quality.show||`` block makes visible the changes made since the last ``||kitronik_air_quality.show||``.  
```blocks
let statusLEDs: kitronik_air_quality.statusLEDs = null
statusLEDs.show()
```
  
To turn the LEDs off, use the ``||kitronik_air_quality.clear||`` block. To view the changes there needs to be a ``||kitronik_air_quality.show||`` block after this block.  
```blocks
let statusLEDs: kitronik_air_quality.statusLEDs = null
statusLEDs.clear()
```
  
``||kitronik_air_quality.rotate||`` moves each LED colour setting along the chain, and then takes the end one back to the first. To view the changes there needs to be a ``||kitronik_air_quality.show||`` block after this block.  
```blocks
let statusLEDs: kitronik_air_quality.statusLEDs = null
statusLEDs.rotate(1)
```
  
The brightness of the LEDs can be controlled with the ``||kitronik_air_quality.set brightness||`` block. To view the changes there needs to be a ``||kitronik_air_quality.show||`` block after this block.  
```blocks
let statusLEDs: kitronik_air_quality.statusLEDs = null
statusLEDs.setBrightness(180)
```

The final three blocks in the ZIP LEDs section are all different ways of choosing or setting a colour for the LEDs.  
* The first is a handy drop-down list of preset colours.
* The second allows the individual Red, Green and Blue components of the colour to be manually set.
* The third changes the Hue, moving round a colour wheel (0-360, red through green and blue and then back to red).
```blocks
let statusLEDs: kitronik_air_quality.statusLEDs = null
statusLEDs.setZipLedColor(0, kitronik_air_quality.colors(ZipLedColors.Purple))
statusLEDs.setZipLedColor(1, kitronik_air_quality.rgb(160, 240, 50))
statusLEDs.setZipLedColor(2, kitronik_air_quality.hueToRGB(157))
```

## Display

These blocks are used to control the OLED display on the board.  
It is split into 8 lines, all of which can be used to display text (up to 26 characters in length).

Text, Numbers and values stored in variables can all be displayed using the ``||kitronik_air_quality.show||`` block.  
The block can be expanded to select which line should be used (the default is always the top of the screen, line 1).  
```blocks
kitronik_air_quality.show("Some text on line 3", 3)
```

The other two blocks are used for clearing the display, either an individual line, or the entire screen:
```blocks
kitronik_air_quality.clearLine(3)
kitronik_air_quality.clear()
```

## Clock
  
These blocks are laid out in groups of linked functionality.  
  
### Set Time
  
This block is used to set the time on the Real Time Clock (RTC) chip.  
```blocks
kitronik_air_quality.setTime(11, 45, 30)
```
  
### Set Date
  
This block is used to set the date on the RTC chip.  
```blocks
kitronik_air_quality.setDate(10, 9, 20)
```
  
### Read Time
  
These blocks are used to read the current time as either a string of the complete time, or the individual elements as numbers.  
```blocks
basic.showString(kitronik_air_quality.readTime())
basic.showNumber(kitronik_air_quality.readTimeParameter(TimeParameter.Hours))
basic.showNumber(kitronik_air_quality.readTimeParameter(TimeParameter.Minutes))
basic.showNumber(kitronik_air_quality.readTimeParameter(TimeParameter.Seconds))
```
  
### Read Date
  
These blocks are used to read the current date as either a string of the complete date, or the individual elements as numbers.  
```blocks
basic.showString(kitronik_air_quality.readDate())
basic.showNumber(kitronik_air_quality.readDateParameter(DateParameter.Day))
basic.showNumber(kitronik_air_quality.readDateParameter(DateParameter.Month))
basic.showNumber(kitronik_air_quality.readDateParameter(DateParameter.Year))
```
  
### Alarm
  
The ``||kitronik_air_quality.set alarm||`` block allows the user to input a time for an alarm to trigger either once, or repeating daily. The alarm can either be silenced by the user, or silenced automatically.  
```blocks
kitronik_air_quality.simpleAlarmSet(kitronik_air_quality.AlarmType.Single, 9, 30, kitronik_air_quality.AlarmSilence.autoSilence)
```
  
The ``||kitronik_air_quality.on alarm trigger||`` bracket block and ``||kitronik_air_quality.alarm triggered||`` block both allow actions to be carried out when the alarm goes off.  
```blocks
kitronik_air_quality.onAlarmTrigger(function () {
    music.startMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once)
})
basic.forever(function () {
    if (kitronik_air_quality.simpleAlarmCheck()) {
        music.startMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once)
    }
})
```
  
The ``||kitronik_air_quality.turn off alarm||`` block allows the alarm to be silenced by the user.  
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.simpleAlarmOff()
})
```
  
## Sensors
  
These blocks are used to control and take readings from the BME688 Air Quality and Environmental sensor.  
These blocks are laid out in groups of linked functionality.  

### Setup

The Temperature, Pressure and Humidity sections of the sensor will work straight away, but the gas sensor (which is used for the Air Quality measurements) needs to be setup.  
The first block sets the correct gas plate temperature and heating time (300°C and 150ms).  
The second block takes a series of gas resistance and temperature measurements over a 5 minute period (the board will not be useable during this time).  
These values are then averaged to provide baselines which are then used in the air quality calculations.  
```blocks
kitronik_air_quality.setupGasSensor()
kitronik_air_quality.calcBaselines()
```

### Measure

This block carries out the read process for all sections of the sensor: Temperature, Pressure, Humidity and Gas Resistance.  
It needs to be called before individual values are read or data is logged.  
```blocks
kitronik_air_quality.measureData()
```

### Climate

These blocks are used to take Temperature (°C or °F), Pressure (Pa or mBar) and Humidity (%) readings, which output as numbers.  
```blocks
basic.showNumber(kitronik_air_quality.pressure(PressureUnitList.Pa))
basic.showNumber(kitronik_air_quality.temperature(TemperatureUnitList.C))
basic.showNumber(kitronik_air_quality.humidity())
```

### Air Quality

These blocks are used to take Air Quality readings and calculate the estimated CO2 level (all output as numbers).  
Air Quality can be given as an IAQ (Index of Air Quality) Score [0 - 500: 0 = Very Good, 500 = Very Bad] or as a percentage [0 - 100%,: 0 = Very Bad, 100% = Very Good].  
```blocks
basic.showNumber(kitronik_air_quality.getAirQualityScore())
basic.showNumber(kitronik_air_quality.getAirQualityPercent())
basic.showNumber(kitronik_air_quality.readeCO2())
```
  
## Data Logging
  
The Data Logging blocks are used to organise and format measured information, and then transfer this information to a computer connected to the micro:bit via USB.  
Several things are setup automatically in the background:  
* A header line is created which will be at the top of the data transfer: "Kitronik Data Logger - Air Quality & Environmental Board for BBC micro:bit - www.kitronik.co.uk".
* The data headings will be set: "Date  Time  Temperature  Pressure  Humidity  IAQ Score  eCO2  Light".
* The data separator is set to always be a semicolon ("**;**").

The blocks are laid out in groups of linked functionality.  
  
### Setup
  
This block is used to add project information (Name and Subject) to the data logging output.  

**Note:** The pound stirling symbol ("**£**") must **NOT** be used in either text field as it is the end of line character.  
```blocks
kitronik_air_quality.addProjectInfo("My Name", "My Subject")
```
  
### Add Data
  
The ``||kitronik_air_quality.log data||`` block is used add a data entry to the data store (the entry will automatically include: Date, Time, Temperature, Pressure, Humidity, IAQ Score, eCO2 and Light Level).  
**Note:** There is a maxmium of 1000 data entries - if this is exceeded, the first data in the memory will start to be overwritten.  
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.logData()    
})
```
The ``||kitronik_air_quality.erase all data||`` block does exactly what it says: it removes all the previously stored data entries.  
```blocks
input.onButtonPressed(Button.B, function () {
    kitronik_air_quality.eraseData()
})
```
  
### Transfer
  
Once data has been collected, it will need to be transferred to a connected computer (all the data entries are transmitted at once).  
In order to see the transmitted data, a serial port monitor needs to be used.  
If the micro:bit is connected to MakeCode via WebUSB, the built in serial monitor can be used and the output can then be copied from there into a separate file, or a dedicated serial monitor program can be downloaded.  

```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.sendAllData()
})
```
  
## License

MIT

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>