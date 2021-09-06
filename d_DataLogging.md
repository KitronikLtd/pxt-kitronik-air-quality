### @activities true
### @explicitHints true

# Data Logging and Transfer

## Data Logging
### Introduction Step @unplugged
One of the main features of the Air Quality Board is that all of the sensor measurements can be captured and stored on the onboard EEPROM (permanent memory).  
Using the EEPROM rather than the micro:bit means that much more data can be stored, and it is still kept even when the power supply to the board is removed.  
This data can then be easily transferred to a computer via the micro:bit USB connector.  
    
The "Date and Time" tutorial should be completed before this one - if is has not been done, click [here](https://makecode.microbit.org/#tutorial:https://github.com/KitronikLtd/pxt-kitronik-smart-greenhouse/a_VisualThermometerTutorial) to access it.  

![Environmental Control Board with status LEDs on](https://KitronikLtd.github.io/pxt-kitronik-smart-greenhouse/assets/status-leds-SMALL.png)

### Step 1
Begin with the same starting code as the "Date and Time" tutorial: set the date and time in the ``||basic:on start||`` bracket.  
These will be used to provide a time stamp for the data being collected.  

#### ~ tutorialhint
```blocks
kitronik_air_quality.setDate(6, 9, 21)
kitronik_air_quality.setTime(13, 00, 0)
```

### Step 2
After the date and time blocks, insert the ``||kitronik_air_quality.add project info||`` block from the ``||kitronik_air_quality.Data Logging||`` section of the ``||kitronik_air_quality.Air Quality||`` category and fill in the "Name" and "Subject" details.  

#### ~ tutorialhint
```blocks
kitronik_air_quality.setDate(6, 9, 21)
kitronik_air_quality.setTime(13, 0, 0)
kitronik_air_quality.addProjectInfo("My Name", "My Project")
```

### Step 3
Finally, for the setup stage, add the ``||kitronik_air_quality.setup gas sensor||`` and ``||kitronik_air_quality.establish gas baseline||`` blocks (as in the "Read Measurements from the BME688" tutorial).  

#### ~ tutorialhint
```blocks
kitronik_air_quality.setDate(6, 9, 21)
kitronik_air_quality.setTime(13, 0, 0)
kitronik_air_quality.addProjectInfo("My Name", "My Project")
kitronik_air_quality.setupGasSensor()
kitronik_air_quality.calcBaselines()
```

### Step 4
Now that the setup is complete, the next step is the actual data logging process.  
Add an ``||input:on button A pressed||`` block, and inside, put a ``||loops:repeat 25 times||`` loop from the ``||loops:Loops||`` category.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    for (let index = 0; index < 25; index++) {
    	
    }
})
```

### Step 5
The ``||loops:repeat||`` loop needs to measure all the data readings, then log the data, and have a pause of 5 seconds at the end.  
Include the correct blocks to enable this to happen.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    for (let index = 0; index < 25; index++) {
    	kitronik_air_quality.measureData()
        kitronik_air_quality.logData()
        basic.pause(5000)
    }
})
```

### Step 6
Pressing ``||input:button A||`` will now run through the data capture process 25 times, taking about 2 minutes to complete the loop.  
It would be very helpful to know when the logging process is running, and when it has finished.  
Using the ``||kitronik_air_quality.show||`` blocks from the ``||kitronik_air_quality.Display||`` section, display a message on the OLED screen before the logging loop and another after it to indicate when the process is complete.  
**Remember**, it is good to clear the screen after the message is no longer needed, ready for the next one.

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.show("Logging...", 1)
    for (let index = 0; index < 25; index++) {
        kitronik_air_quality.measureData()
        kitronik_air_quality.logData()
        basic.pause(5000)
    }
    kitronik_air_quality.clearLine(1)
    kitronik_air_quality.show("Logging Complete!", 1)
    basic.pause(2000)
    kitronik_air_quality.clear()
})
```

### Step 7
The program will now capture data and store it on the Air Quality Board EEPROM. Next, it needs to be able to transfer the logged data to a computer.  
Insert another ``||input:button press||`` block, changing the drop-down to ``||input:B||``. Inside the bracket, add the ``||kitronik_air_quality.transmit all data||`` block from the ``||kitronik_air_quality.Data Logging||`` section of the ``||kitronik_air_quality.Air Quality||`` category.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.B, function () {
    kitronik_air_quality.sendAllData()
})
```

### Step 8
Finally, it would be good to have a way to delete all the data currently stored in the memory.  
Add another ``||input:button press||`` block, changing the drop-down to ``||input:A+B||``. Inside, include the ``||kitronik_air_quality.erase all data||`` block, and then put messages to display before and after to show when the erase is complete, just like with the logging process.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.AB, function () {
    kitronik_air_quality.show("Erasing memory...", 4)
    kitronik_air_quality.eraseData()
    kitronik_air_quality.clearLine(4)
    kitronik_air_quality.show("Erase Complete!", 4)
    basic.pause(2000)
    kitronik_air_quality.clear()
})
```

### Step 9
Click ``|Download|`` and transfer the code to the Air Quality Board.  
Start up the board, allowing it to complete the gas sensor setup process, and then press ``||input:button A||`` to log some data.   

## Transfer to a Computer
### Introduction Step @unplugged




### Step 4
Click ``|Download|`` and transfer the code to the Air Quality Board.  
Make sure the date and time are displaying and updating correctly on the screen.   

CODING COMPLETE! The tutorial is now complete - try out the others available to learn more about using the Kitronik Air Quality and Environmental Board.