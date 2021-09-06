### @activities true
### @explicitHints true

# Date and Time

## Set and Display Date and Time
### Introduction Step @unplugged
The Air Quality Board comes with a Real Time Clock (RTC) which means it is accurately able to keep time. This is very useful for things like data logging where a time stamp is needed for seeing how things vary over time.  
  
The "OLED Display Screen" tutorial should be completed before this one - if is has not been done, click [here](https://makecode.microbit.org/#tutorial:https://github.com/KitronikLtd/pxt-kitronik-air-quality/b_DisplayScreen) to access it.  

![Air Quality board with OLED screen displaying data](https://KitronikLtd.github.io/pxt-kitronik-air-quality/assets/air-quality-board.jpg)

### Step 1
Setting the date and time is very straightforward.  
From the ``||kitronik_air_quality.Clock||`` section of the ``||kitronik_air_quality.Air Quality||`` category, add the ``||kitronik_air_quality.set Date||`` and ``||kitronik_air_quality.set Time||`` blocks into the ``||basic:on start||`` bracket.  
Then, set the current date and time (the time will probably need to be adjusted just before downloading the program to the micro:bit).  

#### ~ tutorialhint
```blocks
kitronik_air_quality.setDate(6, 9, 21)
kitronik_air_quality.setTime(12, 48, 0)
```

### Step 2
As with the climate readings, the OLED screen provides a great place to display the date and time, just like a digital clock.  
Into the ``||basic:forever||`` bracket, insert two ``||kitronik_air_quality.show||`` blocks, and then expand them with the **+** button to set the display lines to **1** and **2**.  

#### ~ tutorialhint
```blocks
basic.forever(function () {
    kitronik_air_quality.show(0, 1)
    kitronik_air_quality.show(0, 2)
})
```

### Step 3
To make the blocks actually display something, add the ``||kitronik_air_quality.Read Date as String||`` and ``||kitronik_air_quality.Read Time as String||`` blocks into the ``||kitronik_air_quality.shows||``.  
Finally, include a ``||kitronik_air_quality.clear display||`` block to the start of the ``||basic:forever||`` loop to make sure the screen is refreshed properly.  

#### ~ tutorialhint
```blocks
basic.forever(function () {
    kitronik_air_quality.clear()
    kitronik_air_quality.show(kitronik_air_quality.readDate(), 1)
    kitronik_air_quality.show(kitronik_air_quality.readTime(), 2)
})
```

### Step 4
Click ``|Download|`` and transfer the code to the Air Quality Board.  
Make sure the date and time are displaying and updating correctly on the screen.   

CODING COMPLETE! The tutorial is now complete - try out the others available to learn more about using the Kitronik Air Quality and Environmental Board.
