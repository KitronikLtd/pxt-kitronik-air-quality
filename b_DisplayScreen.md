### @activities true
### @explicitHints true

# OLED Display Screen

## Using the OLED Display Screen
### Introduction Step @unplugged
The Air Quality Board has a small but very useful OLED screen which can be used to display text, numbers and values stored in variables.  
  
The "Read Measurements from the BME688" tutorial should be completed before this one - if is has not been done, click [here](https://makecode.microbit.org/#tutorial:https://github.com/KitronikLtd/pxt-kitronik-smart-greenhouse/a_VisualThermometerTutorial) to access it.  

![Environmental Control Board with status LEDs on](https://KitronikLtd.github.io/pxt-kitronik-smart-greenhouse/assets/status-leds-SMALL.png)

### Step 1
To get started, place a ``||kitronik_air_quality.show||`` block from the ``||kitronik_air_quality.Display||`` section of the ``||kitronik_air_quality.Air Quality||`` category.  
To display text, a text box needs to be added into the block. This is the first block in the ``||text:Text||`` category (click on the **Advanced** arrow to find more categories).  

#### ~ tutorialhint
```blocks
kitronik_air_quality.show("")
```

### Step 2
Now type some text into the text box to display on the screen (up to 26 characters can be displayed).  

#### ~ tutorialhint
```blocks
kitronik_air_quality.show("Air Quality Board")
```

### Step 3
Click ``|Download|`` and transfer the code to the Air Quality Board.  
Check that the message displays as expected. 

### Step 4
The message will have appeared on the top line of the screen - this is the default setting. By clicking on the **+** button on the right of the block there is the option to specify a line (1 to 8).  
Try this now, adding in another ``||kitronik_air_quality.show||`` block and displaying a different message on a different line.  

#### ~ tutorialhint
```blocks
kitronik_air_quality.show("Air Quality Board", 1)
kitronik_air_quality.show("A new message", 6)
```

### Step 5
Click ``|Download|`` and transfer the code to the Air Quality Board.  
Check that the messages are displaying where they should be.  

### OLED screen better than micro:bit @unplugged
Now that the functionality of the ``||kitronik_air_quality.show||`` block has been explained, it can used to improve the program from the first tutorial.  
Although the micro:bit LED display is useful for displaying text and numbers, it can be quite hard to read longer messages - the OLED screen is much better for this!  

### Step 6
First, delete all the blocks in the ``||basic:on start||`` bracket, then add in an ``||input:on button A pressed||`` block.  
Inside this, include a ``||kitronik_air_quality.measure all data readings||`` block, followed by **three** ``||kitronik_air_quality.show||`` blocks.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.measureData()
    kitronik_air_quality.show(0)
    kitronik_air_quality.show(0)
    kitronik_air_quality.show(0)
})
```

### Step 7
Unlike the micro:bit display, the OLED screen is not limited to displaying a single message at a time.  
Click the **+** button on the ``||kitronik_air_quality.show||`` blocks and set them to display on lines 1, 2 and 3.  
Then, from the ``||kitronik_air_quality.Sensors||`` section, add the ``||kitronik_air_quality.Read Temperature||``, ``||kitronik_air_quality.Pressure||`` and ``||kitronik_air_quality.Humidity||`` blocks - one into each ``||kitronik_air_quality.show||``.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.measureData()
    kitronik_air_quality.show(kitronik_air_quality.readTemperature(kitronik_air_quality.TemperatureUnitList.C), 1)
    kitronik_air_quality.show(kitronik_air_quality.readPressure(kitronik_air_quality.PressureUnitList.Pa), 2)
    kitronik_air_quality.show(kitronik_air_quality.readHumidity(), 3)
})
```

### Step 8
Click ``|Download|`` and transfer the code to the Air Quality Board.  
See the different readings display on the screen.  

### Step 9
As there is more space and flexibility with the OLED screen, the measurement display can be made better by adding some extra descriptions.  
The three ``||kitronik_air_quality.Read||`` blocks need to be temporarily dragged out of the ``||kitronik_air_quality.show||`` blocks and left in the editor window (they will be needed again soon).  
Then, from the ``||text:Text||`` category, add a ``||text:join||`` block into to each ``||kitronik_air_quality.show||``.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.measureData()
    kitronik_air_quality.show("Hello" + "World", 1)
    kitronik_air_quality.show("Hello" + "World", 2)
    kitronik_air_quality.show("Hello" + "World", 3)
})
```

### Step 10
In the first slot of each of the ``||text:join||`` blocks, write a title for the reading being displayed, and then drag the appropriate ``||kitronik_air_quality.Read||`` block into the second slot.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.measureData()
    kitronik_air_quality.show("Temperature: " + kitronik_air_quality.readTemperature(kitronik_air_quality.TemperatureUnitList.C), 1)
    kitronik_air_quality.show("Pressure: " + kitronik_air_quality.readPressure(kitronik_air_quality.PressureUnitList.Pa), 2)
    kitronik_air_quality.show("Humidity: " + kitronik_air_quality.readHumidity(), 3)
})
```

### Step 11
Finally, click the **+** button on each ``||text:join||`` to add another textbox and then write in the units for each measurement.  

#### ~ tutorialhint
```blocks
input.onButtonPressed(Button.A, function () {
    kitronik_air_quality.measureData()
    kitronik_air_quality.show("Temperature: " + kitronik_air_quality.readTemperature(kitronik_air_quality.TemperatureUnitList.C) + " C", 1)
    kitronik_air_quality.show("Pressure: " + kitronik_air_quality.readPressure(kitronik_air_quality.PressureUnitList.Pa) + " Pa", 2)
    kitronik_air_quality.show("Humidity: " + kitronik_air_quality.readHumidity() + " %", 3)
})
```

### Step 8
Click ``|Download|`` and transfer the code to the Air Quality Board.   

CODING COMPLETE! The tutorial is now complete - try out the others available to learn more about using the Kitronik Air Quality and Environmental Board.