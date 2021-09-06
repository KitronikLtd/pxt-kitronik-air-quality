### @activities true
### @explicitHints true

# Data Logging and Transfer

## Data Logging
### Introduction Step @unplugged
One of the main features of the Air Quality Board is that all of the sensor measurements can be captured and stored on the onboard EEPROM (permanent memory).  
Using the EEPROM rather than the micro:bit means that much more data can be stored, and it is still kept even when the power supply to the board is removed.  
This data can then be easily transferred to a computer via the micro:bit USB connector.  
    
The "Date and Time" tutorial should be completed before this one - if is has not been done, click [here](https://makecode.microbit.org/#tutorial:https://github.com/KitronikLtd/pxt-kitronik-air-quality/c_DateandTime) to access it.  

![Air Quality board with OLED screen displaying data](https://KitronikLtd.github.io/pxt-kitronik-air-quality/assets/air-quality-board.jpg)

### micro:bit Setup @unplugged
For this tutorial, the BBC micro:bit plugged into the Air Quality Board needs to be connected via USB to a computer all the time, and the micro:bit needs to be 'Paired' within MakeCode (**Note:** To be able to 'Pair' in MakeCode, the micro:bit firmware must be 0249 or higher; click [here](https://microbit.org/get-started/user-guide/firmware/) for more information).  
  
Once the micro:bit is connected via USB, click the three dots to the right of the ``|Download|`` button, then select "Pair device" from the list.  
![GIF showing opening the Pairing window](https://KitronikLtd.github.io/pxt-kitronik-air-quality/assets/pair-microbit-part-1.gif)  
This will open the Pairing window. From there, click the ``|Pair device|`` button, select the connected micro:bit from the list and click "Connect".  
![GIF showing connecting the micro:bit](https://KitronikLtd.github.io/pxt-kitronik-air-quality/assets/pair-microbit-part-2.gif)  
The ``|Download|`` button should now have the USB symbol in front of it. The micro:bit is now paired and the rest of the tutorial can be completed.

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

Once the logging process has completed, move on to the next stage of the tutorial. 

## Transfer to a Computer
### Step 1
There will now be 25 data entries stored on the EEPROM, ready to be transferred to the computer via the USB cable.  
Press ``||input:Button B||`` on the micro:bit. This will will make the "**Show console** Device" button appear under the micro:bit simulation image. Click on the new button.  

#### ~ tutorialhint
![Click on Show console button](https://KitronikLtd.github.io/pxt-kitronik-air-quality/assets/show-console-button.gif)

### Step 2
After clicking the console button, the code editor window will disappear and be replaced with either a white screen (in which case, press ``||input:Button B||`` again) or a screen with a scrolling chart at the top and the transmitted data text at the bottom - this is the console display.  
In the top right corner of the window there are three buttons. To export and download the data as a text file, click the button furthest to the right.

#### ~ tutorialhint
![Export data as text file](https://KitronikLtd.github.io/pxt-kitronik-air-quality/assets/export-data-text-file.gif)

### Step 3
Now open a new spreadsheet in Microsoft Excel (this has also been tested in Google Sheets and LibreOffice Calc, although they have a slightly different import process).  
Select a cell in the spreadsheet, and then go to the "Data" tab in the top bar. Click on "From Text" to begin the data import process.

#### ~ tutorialhint
![Export data as text file](https://KitronikLtd.github.io/pxt-kitronik-air-quality/assets/excel-data-from-text.gif)

### Step 4
A File Explorer window will have now opened. Go the folder where the text file from MakeCode was downloaded (probably "Downloads") and select the file. Click the "Import" button at the bottom of the window. This will start the "Text Import Wizard".

### Step 5
Make sure the "Delimited" box is checked, as the data is separated by semicolons. Click "Next".
Check the "Semicolon" box and uncheck the "Tab" box this will make sure that the correct separator between data entries is identfied. Click "Next" and then "Finish".  
In the final window, make sure "Existing worksheet" is checked as the import location and then click "OK". The data will now have been imported to the spreadsheet and is ready to be analysed, manipulated and understood. 

#### ~ tutorialhint
![Export data as text file](https://KitronikLtd.github.io/pxt-kitronik-air-quality/assets/excel-text-import-wizard.gif)

CODING COMPLETE! The tutorial is now complete - try out the others available to learn more about using the Kitronik Air Quality and Environmental Board.