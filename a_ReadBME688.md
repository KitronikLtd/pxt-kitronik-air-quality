### @activities true
### @explicitHints true

# Read Measurements from the BME688

## Temperature, Pressure and Humidity
### Introduction Step @unplugged
To get started with the BME688, learn how to read climate data from the sensor and display it on the micro:bit LEDs.  

![Air Quality board with OLED screen displaying data](https://KitronikLtd.github.io/pxt-kitronik-air-quality/assets/air-quality-board.jpg)

### Step 1
Start by adding an ``||input:on button A pressed||`` block into the program.  
Insert a ``||basic:show number||`` block from the ``||basic:Basic||`` into the button press bracket.  
Inside this block, add a ``||kitronik_air_quality.measure all data readings||`` block from the ``||kitronik_air_quality.Sensors||`` section of the ``||kitronik_air_quality.Air Quality||`` category.  
Follow this with a ``||kitronik_air_quality.Read Temperature||`` block (choose the unit, either °C or °F).  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.measureData()
    basic.showNumber(kitronik_air_quality.readTemperature(kitronik_air_quality.TemperatureUnitList.C))
})
```

### Step 2
The program will now take all the measurements from the BME688 sensor, and then display temperature on the micro:bit LEDs.  
In two more button press brackets (``||input:button B||`` and ``||input:button A + B||``) add the functionality to display Pressure and Humidity as well.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.B, function () {
    kitronik_air_quality.measureData()
    basic.showNumber(kitronik_air_quality.readPressure(kitronik_air_quality.PressureUnitList.Pa))
})
input.onButtonPressed(Button.AB, function () {
    kitronik_air_quality.measureData()
    basic.showNumber(kitronik_air_quality.readHumidity())
})
```

### Step 3
Click ``|Download|`` and transfer the code to the Air Quality Board.  
Press each button combination to see the micro:bit display the different readings.  
Try putting the board in different locations to see how the values change.  

## Air Quality readings
### Introduction Step @unplugged
The climate measurements can be taken straight away from the BME688 sensor, but a little bit of setup is required for measuring the air quality.  

### Step 1
To begin with, delete all the ``||basic:show number||`` blocks from the code.  
This will make an easier starting point for modifying the program to measure and display air quality readings.  

### Step 2
The setup process requires some code to run when the micro:bit and board are first turned on, so this needs to go in the ``||basic:on start||`` bracket.  
From the ``||kitronik_air_quality.Air Quality||`` cateogry, pull in the ``||kitronik_air_quality.setup gas sensor||`` block, followed by ``||kitronik_air_quality.establish gas baseline||``. The full gas sensor setup and baseline process takes around 5 minutes. It is important to wait for this process to finish before taking any readings, otherwise the readings will be inaccurate.

#### ~ tutorialhint
```blocks
kitronik_air_quality.setupGasSensor()
kitronik_air_quality.calcBaselines()
```

### Step 3
Now that the gas sensor has been setup, air quality and estimated CO2 (eCO2) values can be measured and calculated.  
Just like in the previous program, use ``||basic:show number||`` blocks to display the different air quality parameters on different button presses.  
There are two options for IAQ (Index of Air Quality) as it can either be a score (0 = Very Good to 500 = Very Bad) or a percentage (0 = Very Bad to 100 = Very Good).  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.measureData()
    basic.showNumber(kitronik_air_quality.getAirQualityScore())
})
input.onButtonPressed(Button.AB, function () {
    kitronik_air_quality.measureData()
    basic.showNumber(kitronik_air_quality.readeCO2())
})
input.onButtonPressed(Button.B, function () {
    kitronik_air_quality.measureData()
    basic.showNumber(kitronik_air_quality.getAirQualityPercent())
})
```

### Step 4
Once the program is complete, click ``|Download|`` and transfer the code to the Air Quality Board.  
Press each button combination to see the micro:bit display the different readings.  
**Note:** The setup process takes around 5 mins to complete and the other program features will not operate until it is complete - messages will be automatically displayed on the Air Quality Board screen.  
Try putting the board in different locations to see how the values change.  
  
CODING COMPLETE! The tutorial is now complete - try out the others available to learn more about using the Kitronik Air Quality and Environmental Board.