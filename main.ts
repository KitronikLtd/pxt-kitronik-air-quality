/*
  Kitronik package for use with the Air Quality Board (www.kitronik.co.uk/5674)
  This package pulls in other packages to deal with the lower level work for:
    Setting and reading a Real Time Clock chip
*/

/**
* Well known colors for ZIP LEDs
*/
enum ZipLedColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

/** 
 * Different time options for the Real Time Clock
 */
enum TimeParameter {
    //% block=hours
    Hours,
    //% block=minutes
    Minutes,
    //% block=seconds
    Seconds
}

/**
 * Different date options for the Real Time Clock
 */
enum DateParameter {
    //% block=day
    Day,
    //% block=month
    Month,
    //% block=year
    Year
}

//List of different temperature units
enum TemperatureUnitList {
    //% block="°C"
    C,
    //% block="°F"
    F
}

//List of different pressure units
enum PressureUnitList {
    //% block="Pa"
    Pa,
    //% block="mBar"
    mBar
}

/**
 * Kitronik Air Quality Board MakeCode Extension
 */

//% weight=100 color=#00A654 icon="\uf0c2" block="Air Quality"
//% groups='["Show", "Delete", "Set Time", "Set Date", "Read Time", "Read Date", "Alarm", "Setup", "Measure", "Climate", "Air Quality", "Settings", "Add Data", "Transfer"]'
namespace kitronik_air_quality {
    ////////////////////////////////
    //         ZIP LEDS           //
    ////////////////////////////////

    export class airQualityZIPLEDs {
        buf: Buffer;
        pin: DigitalPin;
        brightness: number;
        start: number;
        _length: number;

        /**
         * Rotate LEDs forward.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of ZIP LEDs to rotate forward, eg: 1
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_rotate" block="%statusLEDs|rotate ZIP LEDs by %offset" blockGap=8
        //% weight=92
        rotate(offset: number = 1): void {
            this.buf.rotate(-offset * 3, this.start * 3, this._length * 3)
        }

        /**
         * Shows all the ZIP LEDs as a given color (range 0-255 for r, g, b). 
         * @param rgb RGB color of the LED
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_set_strip_color" block="%statusLEDs|show color %rgb=kitronik_air_quality_colors" 
        //% weight=97 blockGap=8
        showColor(rgb: number) {
            rgb = rgb >> 0;
            this.setAllRGB(rgb);
            this.show();
        }

        /**
         * Set particular ZIP LED to a given color. 
         * You need to call ``show changes`` to make the changes visible.
         * @param zipLedNum position of the ZIP LED in the string
         * @param rgb RGB color of the ZIP LED
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_set_zip_color" block="%statusLEDs|set ZIP LED %zipLedNum|to %rgb=kitronik_air_quality_colors" 
        //% weight=95 blockGap=8
        setZipLedColor(zipLedNum: number, rgb: number): void {
            this.setPixelRGB(zipLedNum >> 0, rgb >> 0);
        }

        /**
         * Send all the changes to the ZIP LEDs.
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_show" block="%statusLEDs|show"
        //% weight=94 blockGap=8
        show() {
            //use the Kitronik version which respects brightness for all 
            //ws2812b.sendBuffer(this.buf, this.pin, this.brightness);
            // Use the pxt-microbit core version which now respects brightness (10/2020)
            light.sendWS2812BufferWithBrightness(this.buf, this.pin, this.brightness);
            control.waitMicros(100) // This looks messy, but it fixes the issue sometimes found when using multiple ZIP LED ranges, where the settings for the first range are clocked through to the next range. A short pause allows the ZIP LEDs to realise they need to stop pushing data.
        }

        /**
         * Turn off all the ZIP LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_clear" block="%statusLEDs|clear"
        //% weight=93 blockGap=8
        clear(): void {
            this.buf.fill(0, this.start * 3, this._length * 3);
        }

        /**
         * Set the brightness of the ZIP LEDs. This flag only applies to future show operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_set_brightness" block="%statusLEDs|set brightness %brightness" blockGap=8
        //% weight=91
        //% brightness.min=0 brightness.max=255
        setBrightness(brightness: number): void {
            //Clamp incoming variable at 0-255 as values out of this range cause unexpected brightnesses as the lower level code only expects a byte.
            if (brightness < 0) {
                brightness = 0
            }
            else if (brightness > 255) {
                brightness = 255
            }
            this.brightness = brightness & 0xff;
            basic.pause(1) //add a pause to stop wierdnesses
        }

        //Sets up the buffer for pushing LED control data out to LEDs
        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            this.buf[offset + 0] = green;
            this.buf[offset + 1] = red;
            this.buf[offset + 2] = blue;
        }

        //Separates out Red, Green and Blue data and fills the LED control data buffer for all LEDs
        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * 3, red, green, blue)
            }
        }

        //Separates out Red, Green and Blue data and fills the LED control data buffer for a single LED
        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * 3;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            this.setBufferRGB(pixeloffset, red, green, blue)
        }
    }

    /**
     * Create a new ZIP LED driver for Air Quality Board.
     */
    //% subcategory="ZIP LEDs"
    //% blockId="kitronik_air_quality_display_create" block="Air Quality Board with 3 ZIP LEDs"
    //% weight=100 blockGap=8
    //% trackArgs=0,2
    //% blockSetVariable=statusLEDs
    export function createAirQualityZIPDisplay(): airQualityZIPLEDs {
        let statusLEDs = new airQualityZIPLEDs;
        statusLEDs.buf = pins.createBuffer(9);
        statusLEDs.start = 0;
        statusLEDs._length = 3;
        statusLEDs.setBrightness(128)
        statusLEDs.pin = DigitalPin.P8;
        pins.digitalWritePin(statusLEDs.pin, 0);
        return statusLEDs;
    }

    /**
     * Converts hue (0-360) to an RGB value. 
     * Does not attempt to modify luminosity or saturation. 
     * Colours end up fully saturated. 
     * @param hue value between 0 and 360
     */
    //% subcategory="ZIP LEDs"
    //% weight=1 blockGap=8
    //% blockId="kitronik_air_quality_hue" block="hue %hue"
    //% hue.min=0 hue.max=360
    export function hueToRGB(hue: number): number {
        let redVal = 0
        let greenVal = 0
        let blueVal = 0
        let hueStep = 2.125
        if ((hue >= 0) && (hue < 120)) { //RedGreen section
            greenVal = Math.floor((hue) * hueStep)
            redVal = 255 - greenVal
        }
        else if ((hue >= 120) && (hue < 240)) { //GreenBlueSection
            blueVal = Math.floor((hue - 120) * hueStep)
            greenVal = 255 - blueVal
        }
        else if ((hue >= 240) && (hue < 360)) { //BlueRedSection
            redVal = Math.floor((hue - 240) * hueStep)
            blueVal = 255 - redVal
        }
        return ((redVal & 0xFF) << 16) | ((greenVal & 0xFF) << 8) | (blueVal & 0xFF);
    }

    /*  The LEDs we are using have centre wavelengths of 470nm (Blue) 525nm(Green) and 625nm (Red) 
    * 	 We blend these linearly to give the impression of the other wavelengths. 
    *   as we cant wavelength shift an actual LED... (Ye canna change the laws of physics Capt)*/

    /**
     * Converts value to red, green, blue channels
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% subcategory="ZIP LEDs"
    //% weight=1 blockGap=8
    //% blockId="kitronik_air_quality_rgb" block="red %red|green %green|blue %blue"
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% subcategory="ZIP LEDs"
    //% weight=2 blockGap=8
    //% blockId="kitronik_air_quality_colors" block="%color"
    export function colors(color: ZipLedColors): number {
        return color;
    }

    //Combines individual RGB settings to be a single number
    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    //Separates red value from combined number
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    //Separates green value from combined number
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    //Separates blue value from combined number
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    /**
     * Converts a hue saturation luminosity value into a RGB color
     */
    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    /**
     * Options for direction hue changes, used by rainbow block (never visible to end user)
     */
    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    ////////////////////////////////
    //            OLED            //
    ////////////////////////////////

    /**
     * Select the alignment of text
     */
    export enum ShowAlign {
        //% block="Left"
        Left,
        //% block="Centre"
        Centre,
        //% block="Right"
        Right
    }

    /**
     * Select direction for drawing lines
     */
    export enum LineDirectionSelection {
        //% block="horizontal"
        horizontal,
        //% block="vertical"
        vertical
    }

    // Constants for Display
    let NUMBER_OF_CHAR_PER_LINE = 26

    // Default address for the display
    let DISPLAY_ADDR_1 = 60
    let DISPLAY_ADDR_2 = 10
    let displayAddress = DISPLAY_ADDR_1;

    // Text alignment, defaulted to "Left"
    //let displayShowAlign = ShowAlign.Left

    // Screen buffers for sending data to the display
    let pageBuf = pins.createBuffer(129);

    /**
     * 'show' allows any number, string or variable to be displayed on the screen.
     * The block is expandable to set the line to display on.
     * @param line is line the text to be started on, eg: 1
     * @param inputData is the text will be show
     */
    //% blockId="kitronik_air_quality_show" block="show %s|| on line %line"
    //% weight=80 blockGap=8
    //% subcategory="Display"
    //% group="Show"
    //% expandableArgumentMode="enable"
    //% inlineInputMode=inline
    //% line.min=1 line.max=8
    export function show(inputData: any, line?: number) {
        let y = 0
        let x = 0
        pageBuf.fill(0)
        let inputString = convertToText(inputData)
        inputString = inputString + " "
        if (kitronik_OLED.initialised == 0) {
            kitronik_OLED.initDisplay()
        }

        // If text alignment has not been specified, default to "Left"
        //if (!displayShowAlign) {
        //    displayShowAlign = ShowAlign.Left
        //}

        // If the screen line has not been specified, default to top line (i.e. y = 0)
        // Otherwise, subtract '1' from the line number to return correct y value
        if (!line) {
            y = 0
        }
        else {
            y = (line - 1)
        }

        // Sort text into lines
        let stringArray: string[] = []
        let numberOfStrings = 0

        //////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////
        /////                                                                                        /////
        /////   When the text to display is much longer than one line it does not split correctly.   /////
        /////   Half of the word appears at the end of the line, and then that whole word is         /////
        /////   repeated at the start of the next line. This needs to be fixed.                      /////
        /////                                                                                        /////
        //////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////

        let previousSpacePoint = 0
        let spacePoint = 0
        let startOfString = 0
        let saveString = ""
        if (inputString.length > NUMBER_OF_CHAR_PER_LINE) {
            if (y == 7) {
                stringArray[numberOfStrings] = inputString.substr(0, (NUMBER_OF_CHAR_PER_LINE - 1))
                numberOfStrings = 1
            }
            else {
                for (let spaceFinder = 0; spaceFinder <= inputString.length; spaceFinder++) {
                    if (inputString.charAt(spaceFinder) == " ") {                                // Check whether the character is a space, if so...
                        spacePoint = spaceFinder                                                // Remember the location of the new space found
                        if ((spacePoint - startOfString) < NUMBER_OF_CHAR_PER_LINE) {            // Check if the current location minus start of string is less than number of char on a screen
                            previousSpacePoint = spacePoint                                     // Remember that point for later
                            if (spaceFinder == (inputString.length - 1)) {
                                saveString = inputString.substr(startOfString, spacePoint)      // Cut the string from start of word to the last space and store it
                                stringArray[numberOfStrings] = saveString
                                numberOfStrings += 1
                            }
                        }
                        else if ((spacePoint - startOfString) > NUMBER_OF_CHAR_PER_LINE) {       // Check if the current location minus start of string is greater than number of char on a screen
                            saveString = inputString.substr(startOfString, previousSpacePoint)  // Cut the string from start of word to the last space and store it
                            stringArray[numberOfStrings] = saveString
                            startOfString = previousSpacePoint + 1                              // Set start of new word from last space plus one position
                            numberOfStrings += 1                                                // Increase the number of strings variable
                        }
                        else if ((spacePoint - startOfString) == NUMBER_OF_CHAR_PER_LINE) {      // Check if the current location minus start of string equals than number of char on a screen
                            saveString = inputString.substr(startOfString, spacePoint)
                            stringArray[numberOfStrings] = saveString
                            startOfString = spacePoint + 1
                            previousSpacePoint = spacePoint
                            numberOfStrings += 1
                        }
                    }
                }
            }
        }
        else {
            stringArray[numberOfStrings] = inputString
            numberOfStrings += 1
        }

        let col = 0
        let charDisplayBytes = 0
        let ind = 0

        // Set text alignment, fill up the screenBuffer with data and send to the display
        for (let textLine = 0; textLine <= (numberOfStrings - 1); textLine++) {
            let displayString = stringArray[textLine]

            //if (inputString.length < (NUMBER_OF_CHAR_PER_LINE - 1)) {
            //    if (displayShowAlign == ShowAlign.Left) {
            //        x = 0
            //    }
            //    else if (displayShowAlign == ShowAlign.Centre) {
            //        x = Math.round((NUMBER_OF_CHAR_PER_LINE - displayString.length) / 2)
            //    }
            //    else if (displayShowAlign == ShowAlign.Right) {
            //        x = (NUMBER_OF_CHAR_PER_LINE - displayString.length - 1) + textLine
            //    }
            //}

            for (let charOfString = 0; charOfString < displayString.length; charOfString++) {
                charDisplayBytes = kitronik_OLED.font[displayString.charCodeAt(charOfString)]
                for (let k = 0; k < 5; k++) {  // 'for' loop will take byte font array and load it into the correct register, then shift to the next byte to load into the next location
                    col = 0
                    for (let l = 0; l < 5; l++) {
                        if (charDisplayBytes & (1 << (5 * k + l)))
                            col |= (1 << (l + 1))
                    }

                    //ind = (x + charOfString) * 5 + y * 128 + k + 1
                    ind = (x + charOfString) * 5 + k + 1 // Removed 'y' component for method using just a single buffer for a page, rather than one for whole display

                    pageBuf[ind] = col

                    //switch (y) {
                    //    case 0: pageBuf0[ind] = col
                    //            break
                    //    case 1: pageBuf1[ind] = col
                    //            break
                    //    case 2: pageBuf2[ind] = col
                    //            break
                    //    case 3: pageBuf3[ind] = col
                    //            break
                    //    case 4: pageBuf4[ind] = col
                    //            break
                    //    case 5: pageBuf5[ind] = col
                    //            break
                    //    case 6: pageBuf6[ind] = col
                    //            break
                    //    case 7: pageBuf7[ind] = col
                    //            break
                    //}

                    //screenBuf[ind] = col
                }
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////
            ///// THIS CURRENTLY WON'T DISPLAY TEXT THAT IS LONGER THAN ONE LINE (ONLY SHOWS THE TOP LINE) /////
            ///// IT WILL SHOW TEXT ON ALL 8 LINES IF THEY ARE ALL SET AS SEPARATE 'show' BLOCKS           /////
            ////////////////////////////////////////////////////////////////////////////////////////////////////

            kitronik_OLED.set_pos(x * 5, y)                               // Set the start position to write to (page addressing mode)

            //let ind02 = x * 5 + y * 128 
            //let buf2 = screenBuf.slice(ind02, ((ind + 1) - ind02))
            //buf2[0] = 0x40
            //pins.i2cWriteBuffer(displayAddress, buf2)       // Send data to the screen

            //switch (y) {
            //    case 0: let pageBuf = pageBuf0.slice(ind02, ((ind + 1) - ind02))
            //            break
            //    case 1: let pageBuf = pageBuf1.slice(ind02, ((ind + 1) - ind02))
            //            break
            //    case 2: let pageBuf = pageBuf2.slice(ind02, ((ind + 1) - ind02))
            //            break
            //    case 3: let pageBuf = pageBuf3.slice(ind02, ((ind + 1) - ind02))
            //            break
            //    case 4: let pageBuf = pageBuf4.slice(ind02, ((ind + 1) - ind02))
            //            break
            //    case 5: let pageBuf = pageBuf5.slice(ind02, ((ind + 1) - ind02))
            //            break
            //    case 6: let pageBuf = pageBuf6.slice(ind02, ((ind + 1) - ind02))
            //            break
            //    case 7: let pageBuf = pageBuf7.slice(ind02, ((ind + 1) - ind02))
            //            break
            //}

            pageBuf[0] = 0x40
            pins.i2cWriteBuffer(displayAddress, pageBuf)       // Send data to the screen

            y += 1
        }
    }

    /**
     * Clear a specific line on the screen (1 to 8).
     * @param line is line to clear, eg: 1
     */
    //% blockId="kitronik_air_quality_clear_line" block="clear line %line"
    //% weight=80 blockGap=8
    //% subcategory="Display"
    //% group="Delete"
    //% expandableArgumentMode="enable"
    //% inlineInputMode=inline
    //% line.min=1 line.max=8
    export function clearLine(line: number) {
        let y = 0
        let x = 0
        if (kitronik_OLED.initialised == 0) {
            kitronik_OLED.initDisplay()
        }

        // Subtract '1' from the line number to return correct y value
        y = (line - 1)

        kitronik_OLED.set_pos(0, y)                               // Set the start position to write to (page addressing mode)
        pageBuf.fill(0)
        pageBuf[0] = 0x40
        pins.i2cWriteBuffer(displayAddress, pageBuf)       // Send data to the screen
    }

    /**
     * Clear all text on the screen.
     */
    //% blockId="kitronik_air_quality_clear" block="clear display"
    //% subcategory="Display"
    //% group="Delete"
    //% weight=63 blockGap=8
    export function clear() {
        if (kitronik_OLED.initialised == 0) {
            kitronik_OLED.initDisplay()
        }

        //screenBuf.fill(0)       // Fill the screenBuf with all '0'
        //screenBuf[0] = 0x40
        //set_pos()               // Set position to the start of the screen
        //pins.i2cWriteBuffer(displayAddress, screenBuf)  // Write clear buffer to the screen

        pageBuf.fill(0)       // Fill the pageBuf with all '0'
        pageBuf[0] = 0x40
        for (let y = 0; y < 8; y++) {
            kitronik_OLED.set_pos(0, y)               // Set position to the start of the screen
            pins.i2cWriteBuffer(displayAddress, pageBuf)  // Write clear buffer to the screen
        }
    }

    ////////////////////////////////
    //            RTC             //
    ////////////////////////////////

    /**
     * Alarm repeat type
     */
    export enum AlarmType {
        //% block="Single"
        Single = 0,
        //% block="Daily Repeating"
        Repeating = 1
    }

    /**
     * Alarm silence type
     */
    export enum AlarmSilence {
        //% block="Auto Silence"
        autoSilence = 1,
        //% block="User Silence"
        userSilence = 2
    }

    let alarmHour = 0       //The hour setting for the alarm
    let alarmMin = 0        //The minute setting for the alarm
    export let alarmSetFlag = 0    //Flag set to '1' when an alarm is set
    let alarmRepeat = 0     //If '1' shows that the alarm should remain set so it triggers at the next time match
    let alarmOff = 0        //If '1' shows that alarm should auto switch off, if '2' the user must switch off 
    let alarmTriggered = 0  //Flag to show if the alarm has been triggered ('1') or not ('0')
    let alarmTriggerHandler: Action
    let alarmHandler: Action
    let simpleCheck = 0 //If '1' shows that the alarmHandler is not required as the check is inside an "if" statement

    /**
     * Set time on RTC, as three numbers
     * @param setHours is to set the hours
     * @param setMinutes is to set the minutes
     * @param setSeconds is to set the seconds
    */
    //% subcategory="Clock"
    //% group="Set Time"
    //% blockId=kitronik_air_quality_set_time 
    //% block="Set Time to %setHours|hrs %setMinutes|mins %setSeconds|secs"
    //% setHours.min=0 setHours.max=23
    //% setMinutes.min=0 setMinutes.max=59
    //% setSeconds.min=0 setSeconds.max=59
    //% weight=100 blockGap=8
    export function setTime(setHours: number, setMinutes: number, setSeconds: number): void {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        let bcdHours = kitronik_RTC.decToBcd(setHours)                           //Convert number to binary coded decimal
        let bcdMinutes = kitronik_RTC.decToBcd(setMinutes)                       //Convert number to binary coded decimal
        let bcdSeconds = kitronik_RTC.decToBcd(setSeconds)                       //Convert number to binary coded decimal
        let writeBuf = pins.createBuffer(2)

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        writeBuf[1] = kitronik_RTC.STOP_RTC                                  //Disable Oscillator
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_HOURS_REG
        writeBuf[1] = bcdHours                                      //Send new Hours value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_MINUTES_REG
        writeBuf[1] = bcdMinutes                                    //Send new Minutes value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        writeBuf[1] = kitronik_RTC.START_RTC | bcdSeconds                            //Send new seconds masked with the Enable Oscillator
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)
    }

    /**
     * Read time from RTC as a string
    */
    //% subcategory="Clock"
    //% group="Read Time"
    //% blockId=kitronik_air_quality_read_time 
    //% block="Read Time as String"
    //% weight=95 blockGap=8
    export function readTime(): string {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        //read Values
        kitronik_RTC.readValue()

        let decSeconds = kitronik_RTC.bcdToDec(kitronik_RTC.currentSeconds, kitronik_RTC.RTC_SECONDS_REG)                  //Convert number to Decimal
        let decMinutes = kitronik_RTC.bcdToDec(kitronik_RTC.currentMinutes, kitronik_RTC.RTC_MINUTES_REG)                  //Convert number to Decimal
        let decHours = kitronik_RTC.bcdToDec(kitronik_RTC.currentHours, kitronik_RTC.RTC_HOURS_REG)                        //Convert number to Decimal

        //Combine hours,minutes and seconds in to one string
        let strTime: string = "" + ((decHours / 10) >> 0) + decHours % 10 + ":" + ((decMinutes / 10) >> 0) + decMinutes % 10 + ":" + ((decSeconds / 10) >> 0) + decSeconds % 10

        return strTime
    }

    /**
     * Set date on RTC as three numbers
     * @param setDay is to set the day in terms of numbers 1 to 31
     * @param setMonths is to set the month in terms of numbers 1 to 12
     * @param setYears is to set the years in terms of numbers 0 to 99
    */
    //% subcategory="Clock"
    //% group="Set Date"
    //% blockId=kitronik_air_quality_set_date 
    //% block="Set Date to %setDays|Day %setMonths|Month %setYear|Year"
    //% setDay.min=1 setDay.max=31
    //% setMonth.min=1 setMonth.max=12
    //% setYear.min=0 setYear.max=99
    //% weight=90 blockGap=8
    export function setDate(setDay: number, setMonth: number, setYear: number): void {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        let leapYearCheck = 0
        let writeBuf = pins.createBuffer(2)
        let readBuf = pins.createBuffer(1)
        let bcdDay = 0
        let bcdMonths = 0
        let bcdYears = 0
        let readCurrentSeconds = 0

        //Check day entered does not exceed month that has 30 days in
        if ((setMonth == 4) || (setMonth == 6) || (setMonth == 9) || (setMonth == 11)) {
            if (setDay == 31) {
                setDay = 30
            }
        }

        //Leap year check and does not exceed 30 days
        if ((setMonth == 2) && (setDay >= 29)) {
            leapYearCheck = setYear % 4
            if (leapYearCheck == 0)
                setDay = 29
            else
                setDay = 28
        }

        let weekday = kitronik_RTC.calcWeekday(setDay, setMonth, (setYear + 2000))

        bcdDay = kitronik_RTC.decToBcd(setDay)                       //Convert number to binary coded decimal
        bcdMonths = kitronik_RTC.decToBcd(setMonth)                  //Convert number to binary coded decimal
        bcdYears = kitronik_RTC.decToBcd(setYear)                    //Convert number to binary coded decimal

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        readBuf = pins.i2cReadBuffer(kitronik_RTC.CHIP_ADDRESS, 1, false)
        readCurrentSeconds = readBuf[0]

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        writeBuf[1] = kitronik_RTC.STOP_RTC                                  //Disable Oscillator
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_WEEKDAY_REG
        writeBuf[1] = weekday                                        //Send new Weekday value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_DAY_REG
        writeBuf[1] = bcdDay                                        //Send new Day value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_MONTH_REG
        writeBuf[1] = bcdMonths                                     //Send new Months value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_YEAR_REG
        writeBuf[1] = bcdYears                                      //Send new Year value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        writeBuf[1] = kitronik_RTC.START_RTC | readCurrentSeconds                    //Enable Oscillator
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)
    }

    /**
     * Read date from RTC as a string
    */
    //% subcategory="Clock"
    //% group="Read Date"
    //% blockId=kitronik_air_quality_read_date 
    //% block="Read Date as String"
    //% weight=85 blockGap=8
    export function readDate(): string {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        //read Values
        kitronik_RTC.readValue()

        let decDay = kitronik_RTC.bcdToDec(kitronik_RTC.currentDay, kitronik_RTC.RTC_DAY_REG)                      //Convert number to Decimal
        let decMonths = kitronik_RTC.bcdToDec(kitronik_RTC.currentMonth, kitronik_RTC.RTC_MONTH_REG)               //Convert number to Decimal
        let decYears = kitronik_RTC.bcdToDec(kitronik_RTC.currentYear, kitronik_RTC.RTC_YEAR_REG)                  //Convert number to Decimal

        //let strDate: string = decDay + "/" + decMonths + "/" + decYears
        let strDate: string = "" + ((decDay / 10) >> 0) + (decDay % 10) + "/" + ((decMonths / 10) >> 0) + (decMonths % 10) + "/" + ((decYears / 10) >> 0) + (decYears % 10)
        return strDate
    }

    /**Read time parameter from RTC*/
    //% subcategory="Clock"
    //% group="Read Time"
    //% blockId=kitronik_air_quality_read_time_parameter 
    //% block="Read %selectParameter| as Number"
    //% weight=75 blockGap=8
    export function readTimeParameter(selectParameter: TimeParameter): number {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }
        let decParameter = 0
        //read Values
        kitronik_RTC.readValue()

        //from enum convert the required time parameter and return
        if (selectParameter == TimeParameter.Hours) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentHours, kitronik_RTC.RTC_HOURS_REG)                   //Convert number to Decimal
        }
        else if (selectParameter == TimeParameter.Minutes) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentMinutes, kitronik_RTC.RTC_MINUTES_REG)                  //Convert number to Decimal
        }
        else if (selectParameter == TimeParameter.Seconds) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentSeconds, kitronik_RTC.RTC_SECONDS_REG)                  //Convert number to Decimal
        }

        return decParameter
    }

    /**Read time parameter from RTC*/
    //% subcategory="Clock"
    //% group="Read Date"
    //% blockId=kitronik_air_quality_read_date_parameter 
    //% block="Read %selectParameter| as Number"
    //% weight=65 blockGap=8
    export function readDateParameter(selectParameter: DateParameter): number {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }
        let decParameter = 0
        //read Values
        kitronik_RTC.readValue()

        //from enum convert the required time parameter and return
        if (selectParameter == DateParameter.Day) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentDay, kitronik_RTC.RTC_DAY_REG)                   //Convert number to Decimal
        }
        else if (selectParameter == DateParameter.Month) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentMonth, kitronik_RTC.RTC_MONTH_REG)                  //Convert number to Decimal
        }
        else if (selectParameter == DateParameter.Year) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentYear, kitronik_RTC.RTC_YEAR_REG)                   //Convert number to Decimal
        }

        return decParameter
    }

    /**
     * Set simple alarm
     * @param alarmType determines whether the alarm repeats
     * @param hour is the alarm hour setting (24 hour)
     * @param min is the alarm minute setting
     * @param alarmSilence determines whether the alarm turns off automatically or the user turns it off
    */
    //% subcategory="Clock"
    //% group=Alarm
    //% blockId=kitronik_air_quality_simple_set_alarm 
    //% block="set %alarmType|alarm to %hour|:%min|with %alarmSilence"
    //% hour.min=0 hour.max=23
    //% min.min=0 min.max=59
    //% sec.min=0 sec.max=59
    //% inlineInputMode=inline
    //% weight=26 blockGap=8
    export function simpleAlarmSet(alarmType: AlarmType, hour: number, min: number, alarmSilence: AlarmSilence): void {
        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        if (alarmType == 1) {
            alarmRepeat = 1     //Daily Repeating Alarm
        }
        else {
            alarmRepeat = 0     //Single Alarm
        }

        if (alarmSilence == 1) {
            alarmOff = 1                //Auto Silence
        }
        else if (alarmSilence == 2) {
            alarmOff = 2                //User Silence
        }

        alarmHour = hour
        alarmMin = min

        alarmSetFlag = 1

        //Set background alarm trigger check running
        control.inBackground(() => {
            while (alarmSetFlag == 1) {
                backgroundAlarmCheck()
                basic.pause(1000)
            }
        })
    }

    //Function to check if an alarm is triggered and raises the trigger event if true
    //Runs in background once an alarm is set, but only if alarmSetFlag = 1
    function backgroundAlarmCheck(): void {
        let checkHour = readTimeParameter(TimeParameter.Hours)
        let checkMin = readTimeParameter(TimeParameter.Minutes)
        if (alarmTriggered == 1 && alarmRepeat == 1) {
            if (checkMin != alarmMin) {
                alarmSetFlag = 0
                alarmTriggered = 0
                simpleAlarmSet(AlarmType.Repeating, alarmHour, alarmMin, alarmOff) //Reset the alarm after the current minute has changed
            }
        }
        if (checkHour == alarmHour && checkMin == alarmMin) {
            alarmTriggered = 1
            if (alarmOff == 1) {
                alarmSetFlag = 0
                if (simpleCheck != 1) {
                    alarmHandler() //This causes a problem for the simpleAlarmCheck() function, so only runs for onAlarmTrigger()
                }
                basic.pause(2500)
                if (alarmRepeat == 1) {
                    control.inBackground(() => {
                        checkMin = readTimeParameter(TimeParameter.Minutes)
                        while (checkMin == alarmMin) {
                            basic.pause(1000)
                            checkMin = readTimeParameter(TimeParameter.Minutes)
                        }
                        alarmTriggered = 0
                        simpleAlarmSet(AlarmType.Repeating, alarmHour, alarmMin, alarmOff) //Reset the alarm after the current minute has changed
                    })
                }
            }
            else if (alarmOff == 2) {
                if (simpleCheck != 1) {
                    alarmHandler() //This causes a problem for the simpleAlarmCheck() function, so only runs for onAlarmTrigger()
                }
            }
        }
        if (alarmTriggered == 1 && alarmOff == 2 && checkMin != alarmMin) {
            alarmSetFlag = 0
            alarmTriggered = 0
        }
    }

    /**
     * Do something if the alarm is triggered
     */
    //% subcategory="Clock"
    //% group=Alarm
    //% blockId=kitronik_air_quality_on_alarm block="on alarm trigger"
    //% weight=25 blockGap=8
    export function onAlarmTrigger(alarmTriggerHandler: Action): void {
        alarmHandler = alarmTriggerHandler
    }

    /**
     * Determine if the alarm is triggered and return a boolean
    */
    //% subcategory="Clock"
    //% group=Alarm
    //% blockId=kitronik_air_quality_simple_check_alarm 
    //% block="alarm triggered"
    //% weight=24 blockGap=8
    export function simpleAlarmCheck(): boolean {
        simpleCheck = 1 //Makes sure the alarmHandler() is not called
        let checkHour = readTimeParameter(TimeParameter.Hours)
        let checkMin = readTimeParameter(TimeParameter.Minutes)
        if (alarmSetFlag == 1 && checkHour == alarmHour && checkMin == alarmMin) {
            if (alarmOff == 1) {
                control.inBackground(() => {
                    basic.pause(2500)
                    alarmSetFlag = 0
                })
            }
            return true
        }
        else {
            return false
        }
    }

    /**
     * Turn off the alarm
    */
    //% subcategory="Clock"
    //% group=Alarm
    //% blockId=kitronik_air_quality_alarm_off 
    //% block="turn off alarm"
    //% weight=23 blockGap=8
    export function simpleAlarmOff(): void {
        alarmSetFlag = 0
        if (alarmTriggered == 1 && alarmRepeat == 1) {
            control.inBackground(() => {
                let checkMin = readTimeParameter(TimeParameter.Minutes)
                while (checkMin == alarmMin) {
                    basic.pause(1000)
                    checkMin = readTimeParameter(TimeParameter.Minutes)
                }
                alarmTriggered = 0
                simpleAlarmSet(AlarmType.Repeating, alarmHour, alarmMin, alarmOff) //Reset the alarm after the current minute has changed
            })
        }
    }

    ////////////////////////////////
    //          BME688            //
    ////////////////////////////////

    //List of different temperature units
    export enum TemperatureUnitList {
        //% block="°C"
        C,
        //% block="°F"
        F
    }

    //List of different pressure units
    export enum PressureUnitList {
        //% block="Pa"
        Pa,
        //% block="mBar"
        mBar
    }

    //Global variables used for storing one copy of value, these are used in multiple locations for calculations
    let bme688InitialiseFlag = false
    let gasInitialise = false

    // Initialise the BME688, establishing communication, entering initial T, P & H oversampling rates, setup filter and do a first data reading (won't return gas)
    export function bme688Init(): void {
        kitronik_BME688.initialise()    // Call BME688 setup function in bme688-base extension

        bme688InitialiseFlag = true

        // Do an initial data read (will only return temperature, pressure and humidity as no gas sensor parameters have been set)
        measureData()
    }

    /**
    * Setup the gas sensor ready to measure gas resistance.
    */
    //% subcategory="Sensors"
    //% group="Setup"
    //% blockId=kitronik_air_quality_setup_gas_sensor
    //% block="setup gas sensor"
    //% weight=100 blockGap=8
    export function setupGasSensor(): void {
        if (bme688InitialiseFlag == false) {
            bme688Init()
        }

        kitronik_BME688.initGasSensor()     // Call BME688 gas sensor setup function in bme-688 base extension

        gasInitialise = true
    }

    /**
    * Run all measurements on the BME688: Temperature, Pressure, Humidity & Gas Resistance.
    */
    //% subcategory="Sensors"
    //% group="Measure"
    //% blockId=kitronik_air_quality_bme688_measure_all
    //% block="measure all data readings"
    //% weight=100 blockGap=8
    export function measureData(): void {
        if (bme688InitialiseFlag == false) {
            bme688Init()
        }

        kitronik_BME688.readDataRegisters()     // Call function in bme-688 base extension to read out all the data registers

        // Calculate the compensated reading values from the the raw ADC data
        kitronik_BME688.calcTemperature(kitronik_BME688.tRaw)
        kitronik_BME688.intCalcPressure(kitronik_BME688.pRaw)
        kitronik_BME688.intCalcHumidity(kitronik_BME688.hRaw, kitronik_BME688.tRead)
        kitronik_BME688.intCalcGasResistance(kitronik_BME688.gResRaw, kitronik_BME688.gasRange)
    }

    // A baseline gas resistance is required for the IAQ calculation - it should be taken in a well ventilated area without obvious air pollutants
    // Take 60 readings over a ~5min period and find the mean
    /**
    * Establish the baseline gas resistance reading and the ambient temperature.
    * These values are required for air quality calculations.
    */
    //% subcategory="Sensors"
    //% group="Setup"
    //% blockId=kitronik_air_quality_establish_baselines
    //% block="establish gas baseline & ambient temperature"
    //% weight=85 blockGap=8
    export function calcBaselines(): void {
        if (bme688InitialiseFlag == false) {
            bme688Init()
        }
        if (gasInitialise == false) {
            setupGasSensor()
        }

        show("Setting baselines", 4)
        show("0%", 5)

        // A baseline gas resistance is required for the IAQ calculation - it should be taken in a well ventilated area without obvious air pollutants
        // Take 60 readings over a ~5min period and find the mean
        // Establish the baseline gas resistance reading and the ambient temperature.
        // These values are required for air quality calculations.
        kitronik_BME688.setAmbTempFlag(true)

        let burnInReadings = 0
        let burnInData = 0
        let ambTotal = 0
        while (burnInReadings < 60) {               // Measure data and continue summing gas resistance until 60 readings have been taken
            kitronik_BME688.readDataRegisters()
            kitronik_BME688.calcTemperature(kitronik_BME688.tRaw)
            kitronik_BME688.intCalcGasResistance(kitronik_BME688.gResRaw, kitronik_BME688.gasRange)
            burnInData += kitronik_BME688.gRes
            ambTotal += kitronik_BME688.tAmbient
            basic.pause(5000)
            burnInReadings++
            clearLine(5)
            show(Math.round((burnInReadings / 60) * 100) + "%", 5)
        }
        kitronik_BME688.setGBase(Math.trunc(burnInData / 60))             // Find the mean gas resistance during the period to form the baseline
        kitronik_BME688.tAmbient = Math.trunc(ambTotal / 60)    // Calculate the ambient temperature as the mean of the 60 initial readings

        kitronik_BME688.setAmbTempFlag(true)

        clear()

        show("Setup Complete!", 5)
        basic.pause(2000)
        clear()
    }

    /**
    * Read Temperature from the sensor as a number.
    * Units for temperature are in °C (Celsius) or °F (Fahrenheit) according to selection.
    */
    //% subcategory="Sensors"
    //% group="Climate"
    //% blockId="kitronik_air_quality_read_temperature"
    //% block="Read Temperature in %temperature_unit"
    //% weight=100 blockGap=8
    export function readTemperature(temperature_unit: TemperatureUnitList): number {
        let temperature = kitronik_BME688.tRead
        // Change temperature from °C to °F if user selection requires it
        if (temperature_unit == TemperatureUnitList.F) {
            temperature = ((temperature * 18) + 320) / 10
        }

        return temperature
    }

    /**
    * Read Pressure from the sensor as a number.
    * Units for pressure are in Pa (Pascals) or mBar (millibar) according to selection.
    */
    //% subcategory="Sensors"
    //% group="Climate"
    //% blockId="kitronik_air_quality_read_pressure"
    //% block="Read Pressure in %pressure_unit"
    //% weight=95 blockGap=8
    export function readPressure(pressure_unit: PressureUnitList): number {
        let pressure = kitronik_BME688.pRead
        //Change pressure from Pascals to millibar if user selection requires it
        if (pressure_unit == PressureUnitList.mBar)
            pressure = pressure / 100

        return pressure
    }

    /**
    * Read Humidity from the sensor as a number.
    * Humidity is output as a percentage.
    */
    //% subcategory="Sensors"
    //% group="Climate"
    //% blockId="kitronik_air_quality_read_humidity"
    //% block="Read Humidity"
    //% weight=80 blockGap=8
    export function readHumidity(): number {
        return kitronik_BME688.hRead
    }

    /**
    * Read eCO2 from sensor as a Number (250 - 40000+ppm).
    * Units for eCO2 are in ppm (parts per million).
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId="kitronik_air_quality_read_eCO2"
    //% block="Read eCO2"
    //% weight=95 blockGap=8
    export function readeCO2(): number {
        if (gasInitialise == false) {
            clear()
            show("ERROR", 3)
            show("Gas Sensor not setup!", 5)
            return 0
        }
        kitronik_BME688.calcAirQuality()

        let eCO2 = kitronik_BME688.eCO2Value

        return eCO2
    }

    /**
    * Return the Air Quality rating as a percentage (0% = Bad, 100% = Excellent).
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId=kitronik_air_quality_iaq_percent
    //% block="get IAQ \\%"
    //% weight=85 blockGap=8
    export function getAirQualityPercent(): number {
        if (gasInitialise == false) {
            clear()
            show("ERROR", 3)
            show("Gas Sensor not setup!", 5)
            return 0
        }
        kitronik_BME688.calcAirQuality()

        return kitronik_BME688.iaqPercent
    }

    /**
    * Return the Air Quality rating as an IAQ score (500 = Bad, 0 = Excellent).
    * These values are based on the BME688 datasheet, Page 11, Table 6.
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId=kitronik_air_quality_iaq_score
    //% block="get IAQ Score"
    //% weight=100 blockGap=8
    export function getAirQualityScore(): number {
        if (gasInitialise == false) {
            clear()
            show("ERROR", 3)
            show("Gas Sensor not setup!", 5)
            return 0
        }
        kitronik_BME688.calcAirQuality()

        return kitronik_BME688.iaqScore
    }

    ////////////////////////////////
    //       DATA LOGGING         //
    ////////////////////////////////

    let delimiter = ";"

    let dataEntry = ""
    let firstDataBlock = 24
    let entryNum = 0
    let writeTitles = false
    let dataFull = false

    // Store the Kitronik Header and standard data column headings in the reserved metadata EEPROM blocks
    function storeTitles(): void {
        let kitronikHeader = "Kitronik Data Logger - Air Quality & Environmental Board for BBC micro:bit - www.kitronik.co.uk\r\n£"
        kitronik_EEPROM.writeBlock(kitronikHeader, 21)

        basic.pause(100)

        let headings = "Date" + delimiter + "Time" + delimiter + "Temperature" + delimiter + "Pressure" + delimiter + "Humidity" + delimiter + "IAQ Score" + delimiter + "eCO2" + delimiter + "Light" + delimiter + "\r\n£"

        kitronik_EEPROM.writeBlock(headings, 23)

        basic.pause(100)

        entryNum = (kitronik_EEPROM.readByte(12 * 128) << 8) | (kitronik_EEPROM.readByte((12 * 128) + 1))              // Read from block 12 how many entries have been stored so far
        entryNum = entryNum & 0xFFF

        writeTitles = true
    }

    /**
     * Input information about the user and project in string format.
     * @param name of person carrying out data logging
     * @param subject area of the data logging project
     */
    //% subcategory="Data Logging"
    //% group="Settings"
    //% weight=80 blockGap=8
    //% blockId=kitronik_air_quality_project_info
    //% block="add project info: Name %name|Subject %subject"
    //% inlineInputMode=inline
    export function addProjectInfo(name: string, subject: string): void {
        let projectInfo = "Name: " + name + "\r\n" + "Subject: " + subject + "\r\n£"

        kitronik_EEPROM.writeBlock(projectInfo, 22)
    }

    /**
     * Captures and logs all data to the EEPROM - "measure all data readings" must be called first.
     * (Date, Time, Temperature, Pressure, Humidity, IAQ Score, eCO2 and Light Level are all automatically added)
     */
    //% subcategory="Data Logging"
    //% group="Add Data"
    //% weight=100 blockGap=8
    //% blockId=kitronik_air_quality_log_data
    //% block="log data"
    export function logData(): void {
        if (writeTitles == false) {
            storeTitles()
        }

        dataEntry = readDate() + delimiter + readTime() + delimiter + readTemperature(TemperatureUnitList.C) + delimiter + readPressure(PressureUnitList.Pa) + delimiter + readHumidity() + delimiter + getAirQualityScore() + delimiter + readeCO2() + delimiter + input.lightLevel() + delimiter

        kitronik_EEPROM.writeBlock(dataEntry + "\r\n£", firstDataBlock + entryNum)

        basic.pause(100)

        // Store the current entry number at first bytes of block 12
        //kitronik_EEPROM.writeBlock(convertToText(entryNum), 12)     // More memory efficient that writing the bytes separately
        let storedEntryNum = entryNum | 0x1000
        let buf = pins.createBuffer(4)
        buf[0] = 0x06
        buf[1] = 0x00
        buf[2] = storedEntryNum >> 8
        buf[3] = storedEntryNum & 0xFF
        pins.i2cWriteBuffer(0x54, buf, false)

        //kitronik_EEPROM.writeByte((storedEntryNum >> 8), (12 * 128))              // Entry Number High Byte
        //kitronik_EEPROM.writeByte((storedEntryNum & 0xFF), ((12 * 128) + 1))      // Entry Number Low Byte

        if (entryNum == 999) {
            dataFull = true
            entryNum = 0
        }
        else {
            entryNum++
        }
    }

    /**
     * Erases all data stored on the EEPROM by writing all bytes to 0xFF (does not erase reserved area).
     */
    //% subcategory="Data Logging"
    //% group="Add Data"
    //% weight=70 blockGap=8
    //% blockId=kitronik_air_quality_erase_data
    //% block="erase all data"
    export function eraseData(): void {
        show("Erasing Memory...", 2)
        let blankBlock = pins.createBuffer(130)
        let addr = 0
        let i2cAddr = 0

        for (let byte = 2; byte < 130; byte++) {
            blankBlock[byte] = 0xFF
        }
        //for (let block = firstDataBlock; block < 1024; block++) {
        for (let block = 0; block < 1024; block++) {
            addr = block * 128
            if ((addr >> 16) == 0) {                               // Select the required address (A16 as 0 or 1)
                i2cAddr = kitronik_EEPROM.CAT24_I2C_BASE_ADDR                           // A16 = 0
            }
            else {
                i2cAddr = kitronik_EEPROM.CAT24_I2C_BASE_ADDR + 1                       // A16 = 1
            }

            blankBlock[0] = (addr >> 8) & 0xFF                            // Memory location bits a15 - a8
            blankBlock[1] = addr & 0xFF                                   // Memory location bits a7 - a0

            pins.i2cWriteBuffer(i2cAddr, blankBlock, false)                    // Write the data to the correct address
            basic.pause(5)
        }

        basic.pause(100)
        // Reset number of entries stored at block 12 to '0'
        let buf = pins.createBuffer(4)
        buf[0] = 0x06
        buf[1] = 0x00
        buf[2] = 0x10
        buf[3] = 0x00
        pins.i2cWriteBuffer(0x54, buf, false)

        writeTitles = false

        clear()
        show("Memory Erase Complete", 2)
        basic.pause(2500)
        clear()
    }

    /**
     * Send all the stored data via USB to a connected computer.
     * (Maximum of 1000 data entries stored)
     */
    //% subcategory="Data Logging"
    //% group="Transfer"
    //% weight=65 blockGap=8
    //% blockId=kitronik_air_quality_send_all
    //% block="transmit all data"
    export function sendAllData(): void {
        serial.redirectToUSB()

        let block = firstDataBlock
        let lastEntry = 0
        let header = ""
        let info = ""
        let titles = ""
        let data = ""

        header = kitronik_EEPROM.readBlock(21)
        serial.writeString(header)      // Send Kitronik Header
        info = kitronik_EEPROM.readBlock(22)
        serial.writeString(info)        // Send Project Info
        titles = kitronik_EEPROM.readBlock(23)
        serial.writeString(titles)      // Send Data Column Headings

        if (dataFull) {
            for (block = firstDataBlock; block < 1024; block++) {
                data = kitronik_EEPROM.readBlock(block)
                serial.writeString(data)
            }
        }
        else {
            let readLastEntry = (kitronik_EEPROM.readByte(12 * 128) << 8) | (kitronik_EEPROM.readByte((12 * 128) + 1))              // Read from block 12 how many entries have been stored so far
            lastEntry = readLastEntry & 0xFFF
            for (block = firstDataBlock; block < (firstDataBlock + lastEntry + 2); block++) {
                data = kitronik_EEPROM.readBlock(block)
                serial.writeString(data)
            }
        }
    }
}
