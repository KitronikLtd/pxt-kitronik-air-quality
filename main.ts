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
//% groups='["Show", "Delete", "Set Time", "Set Date", "Read Time", "Read Date", "Alarm", "Setup", "Measure", "Climate", "Air Quality", "Setup", "Add Data", "Transfer"]'
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

    // ASCII Code to OLED 5x8 pixel character for display conversion
    // font[0 - 31] are non-printable
    // font[32 - 127]: SPACE ! " # $ % & ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8 9 : ; < = > ? @ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ \ ] ^ _ ` a b c d e f g h i j k l m n o p q r s t u v w x y z { | } ~ DEL
    const font = [0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x00000000, 0x000002e0, 0x00018060, 0x00afabea, 0x00aed6ea, 0x01991133, 0x010556aa, 0x00000060, 0x000045c0, 0x00003a20, 0x00051140, 0x00023880, 0x00002200, 0x00021080, 0x00000100, 0x00111110, 0x0007462e, 0x00087e40, 0x000956b9, 0x0005d629, 0x008fa54c, 0x009ad6b7, 0x008ada88, 0x00119531, 0x00aad6aa, 0x0022b6a2, 0x00000140, 0x00002a00, 0x0008a880, 0x00052940, 0x00022a20, 0x0022d422, 0x00e4d62e, 0x000f14be, 0x000556bf, 0x0008c62e, 0x0007463f, 0x0008d6bf, 0x000094bf, 0x00cac62e, 0x000f909f, 0x000047f1, 0x0017c629, 0x0008a89f, 0x0008421f, 0x01f1105f, 0x01f4105f, 0x0007462e, 0x000114bf, 0x000b6526, 0x010514bf, 0x0004d6b2, 0x0010fc21, 0x0007c20f, 0x00744107, 0x01f4111f, 0x000d909b, 0x00117041, 0x0008ceb9, 0x0008c7e0, 0x01041041, 0x000fc620, 0x00010440, 0x01084210, 0x00000820, 0x010f4a4c, 0x0004529f, 0x00094a4c, 0x000fd288, 0x000956ae, 0x000097c4, 0x0007d6a2, 0x000c109f, 0x000003a0, 0x0006c200, 0x0008289f, 0x000841e0, 0x01e1105e, 0x000e085e, 0x00064a4c, 0x0002295e, 0x000f2944, 0x0001085c, 0x00012a90, 0x010a51e0, 0x010f420e, 0x00644106, 0x01e8221e, 0x00093192, 0x00222292, 0x00095b52, 0x0008fc80, 0x000003e0, 0x000013f1, 0x00841080, 0x0022d422];

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
    let displayShowAlign = ShowAlign.Left

    // Plot variables
    let plotArray: number[] = []
    let plottingEnable = 0
    let plotData = 0;
    let graphYMin = 0
    let graphYMax = 100
    let graphRange = 100
    let GRAPH_Y_MIN_LOCATION = 63
    let GRAPH_Y_MAX_LOCATION = 20
    let previousYPlot = 0

    // Screen buffers for sending data to the display
    //let screenBuf = pins.createBuffer(1025);
    // Different buffers for trying memory optimisation
    //let pageBuf0 = pins.createBuffer(129);
    //let pageBuf1 = pins.createBuffer(129);
    //let pageBuf2 = pins.createBuffer(129);
    //let pageBuf3 = pins.createBuffer(129);
    //let pageBuf4 = pins.createBuffer(129);
    //let pageBuf5 = pins.createBuffer(129);
    //let pageBuf6 = pins.createBuffer(129);
    //let pageBuf7 = pins.createBuffer(129);
    let pageBuf = pins.createBuffer(129);

    let ackBuf = pins.createBuffer(2);
    let writeOneByteBuf = pins.createBuffer(2);
    let writeTwoByteBuf = pins.createBuffer(3);
    let writeThreeByteBuf = pins.createBuffer(4);

    let initialised = 0    		// Flag to indicate automatic initalisation of the display

    // Function to write one byte of data to the display
    function writeOneByte(regValue: number) {
        writeOneByteBuf[0] = 0;
        writeOneByteBuf[1] = regValue;
        pins.i2cWriteBuffer(displayAddress, writeOneByteBuf);
    }

    // Function to write two bytes of data to the display
    function writeTwoByte(regValue1: number, regValue2: number) {
        writeTwoByteBuf[0] = 0;
        writeTwoByteBuf[1] = regValue1;
        writeTwoByteBuf[2] = regValue2;
        pins.i2cWriteBuffer(displayAddress, writeTwoByteBuf);
    }

    // Function to write three bytes of data to the display
    function writeThreeByte(regValue1: number, regValue2: number, regValue3: number) {
        writeThreeByteBuf[0] = 0;
        writeThreeByteBuf[1] = regValue1;
        writeThreeByteBuf[2] = regValue2;
        writeThreeByteBuf[3] = regValue3;
        pins.i2cWriteBuffer(displayAddress, writeThreeByteBuf);
    }

    // Set the starting on the display for writing text
    function set_pos(col: number = 0, page: number = 0) {
        writeOneByte(0xb0 | page) // page number
        writeOneByte(0x00 | (col % 16)) // lower start column address
        writeOneByte(0x10 | (col >> 4)) // upper start column address    
    }

    // Set the particular data byte on the screen for clearing
    function clearBit(d: number, b: number): number {
        if (d & (1 << b))
            d -= (1 << b)
        return d
    }

    /**
     * Setup the display ready for use (function on available in text languages, not blocks)
     */
    export function initDisplay(): void {
        // Load the ackBuffer to check if there is a display there before starting initalisation
        ackBuf[0] = 0
        ackBuf[1] = 0xAF
        let ack = pins.i2cWriteBuffer(displayAddress, ackBuf)
        if (ack == -1010) {      // If returned value back is -1010, there is no display so show error message
            basic.showString("ERROR - no display")
        }
        else {   // Start initalising the display
            writeOneByte(0xAE)              // SSD1306_DISPLAYOFF
            writeOneByte(0xA4)              // SSD1306_DISPLAYALLON_RESUME
            writeTwoByte(0xD5, 0xF0)        // SSD1306_SETDISPLAYCLOCKDIV
            writeTwoByte(0xA8, 0x3F)        // SSD1306_SETMULTIPLEX
            writeTwoByte(0xD3, 0x00)        // SSD1306_SETDISPLAYOFFSET
            writeOneByte(0 | 0x0)           // line #SSD1306_SETSTARTLINE
            writeTwoByte(0x8D, 0x14)        // SSD1306_CHARGEPUMP
            writeTwoByte(0x20, 0x00)        // SSD1306_MEMORYMODE
            writeThreeByte(0x21, 0, 127)    // SSD1306_COLUMNADDR
            writeThreeByte(0x22, 0, 63)     // SSD1306_PAGEADDR
            writeOneByte(0xa0 | 0x1)        // SSD1306_SEGREMAP
            writeOneByte(0xc8)              // SSD1306_COMSCANDEC
            writeTwoByte(0xDA, 0x12)        // SSD1306_SETCOMPINS
            writeTwoByte(0x81, 0xCF)        // SSD1306_SETCONTRAST
            writeTwoByte(0xd9, 0xF1)        // SSD1306_SETPRECHARGE
            writeTwoByte(0xDB, 0x40)        // SSD1306_SETVCOMDETECT
            writeOneByte(0xA6)              // SSD1306_NORMALDISPLAY
            writeTwoByte(0xD6, 0)           // Zoom is set to off
            writeOneByte(0xAF)              // SSD1306_DISPLAYON
            initialised = 1
            clear()
        }
    }

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
        let inputString = convertToText(inputData)
        inputString = inputString + " "
        if (initialised == 0) {
            initDisplay()
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
                charDisplayBytes = font[displayString.charCodeAt(charOfString)]
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

            set_pos(x * 5, y)                               // Set the start position to write to (page addressing mode)

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
        if (initialised == 0) {
            initDisplay()
        }

        // Subtract '1' from the line number to return correct y value
        y = (line - 1)

        set_pos(0, y)                               // Set the start position to write to (page addressing mode)
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
        if (initialised == 0) {
            initDisplay()
        }

        //screenBuf.fill(0)       // Fill the screenBuf with all '0'
        //screenBuf[0] = 0x40
        //set_pos()               // Set position to the start of the screen
        //pins.i2cWriteBuffer(displayAddress, screenBuf)  // Write clear buffer to the screen

        pageBuf.fill(0)       // Fill the pageBuf with all '0'
        pageBuf[0] = 0x40
        for (let y = 0; y < 8; y++) {
            set_pos(0, y)               // Set position to the start of the screen
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

    // Useful BME688 Register Addresses
    // Control
    const CHIP_ADDRESS = 0x77    // I2C address as determined by hardware configuration
    const CTRL_MEAS = 0x74       // Bit position <7:5>: Temperature oversampling   Bit position <4:2>: Pressure oversampling   Bit position <1:0>: Sensor power mode
    const RESET = 0xE0           // Write 0xB6 to initiate soft-reset (same effect as power-on reset)
    const CHIP_ID = 0xD0         // Read this to return the chip ID: 0x61 - good way to check communication is occurring
    const CTRL_HUM = 0x72        // Bit position <2:0>: Humidity oversampling settings
    const CONFIG = 0x75          // Bit position <4:2>: IIR filter settings
    const CTRL_GAS_0 = 0x70      // Bit position <3>: Heater off (set to '1' to turn off current injection)
    const CTRL_GAS_1 = 0x71      // Bit position <5> DATASHEET ERROR: Enable gas conversions to start when set to '1'   Bit position <3:0>: Heater step selection (0 to 9)

    // Pressure Data
    const PRESS_MSB_0 = 0x1F     // Forced & Parallel: MSB [19:12]
    const PRESS_LSB_0 = 0x20     // Forced & Parallel: LSB [11:4]
    const PRESS_XLSB_0 = 0x21    // Forced & Parallel: XLSB [3:0]

    // Temperature Data
    const TEMP_MSB_0 = 0x22      // Forced & Parallel: MSB [19:12]
    const TEMP_LSB_0 = 0x23      // Forced & Parallel: LSB [11:4]
    const TEMP_XLSB_0 = 0x24     // Forced & Parallel: XLSB [3:0]

    // Humidity Data
    const HUMID_MSB_0 = 0x25     // Forced & Parallel: MSB [15:8]
    const HUMID_LSB_0 = 0x26     // Forced & Parallel: LSB [7:0]

    // Gas Resistance Data
    const GAS_RES_MSB_0 = 0x2C   // Forced & Parallel: MSB [9:2]
    const GAS_RES_LSB_0 = 0x2D   // Forced & Parallel: Bit <7:6>: LSB [1:0]    Bit <5>: Gas valid    Bit <4>: Heater stability    Bit <3:0>: Gas resistance range

    // Status
    const MEAS_STATUS_0 = 0x1D   // Forced & Parallel: Bit <7>: New data    Bit <6>: Gas measuring    Bit <5>: Measuring    Bit <3:0>: Gas measurement index

    //The following functions are for reading from and writing to the registers on the BME688
    //function for reading register as unsigned 8 bit integer
    function getUInt8BE(reg: number): number {
        pins.i2cWriteNumber(CHIP_ADDRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(CHIP_ADDRESS, NumberFormat.UInt8BE);
    }

    //function for reading register as signed 8 bit integer (big endian)
    function getInt8BE(reg: number): number {
        pins.i2cWriteNumber(CHIP_ADDRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(CHIP_ADDRESS, NumberFormat.Int8BE);
    }

    // Function to convert unsigned ints to twos complement signed ints
    function twosComp(value: number, bits: number): number {
        if ((value & (1 << (bits - 1))) != 0) {
            value = value - (1 << bits)
        }
        return value
    }

    // Write a buffer to a register
    function i2cWrite(reg: number, data: number): void {
        writeBuf[0] = reg
        writeBuf[1] = data
        pins.i2cWriteBuffer(CHIP_ADDRESS, writeBuf)
    }

    // Calibration parameters for compensation calculations
    // Temperature
    let PAR_T1 = twosComp((getUInt8BE(0xEA) << 8) | getUInt8BE(0xE9), 16)   // Signed 16-bit
    let PAR_T2 = twosComp((getInt8BE(0x8B) << 8) | getInt8BE(0x8A), 16)     // Signed 16-bit
    let PAR_T3 = getInt8BE(0x8C)                                            // Signed 8-bit

    // Pressure
    let PAR_P1 = (getUInt8BE(0x8F) << 8) | getUInt8BE(0x8E)                 // Always a positive number, do not do twosComp() conversion!
    let PAR_P2 = twosComp((getUInt8BE(0x91) << 8) | getUInt8BE(0x90), 16)   // Signed 16-bit
    let PAR_P3 = getInt8BE(0x92)                                            // Signed 8-bit
    let PAR_P4 = twosComp((getUInt8BE(0x95) << 8) | getUInt8BE(0x94), 16)   // Signed 16-bit
    let PAR_P5 = twosComp((getUInt8BE(0x97) << 8) | getUInt8BE(0x96), 16)   // Signed 16-bit
    let PAR_P6 = getInt8BE(0x99)                                            // Signed 8-bit
    let PAR_P7 = getInt8BE(0x98)                                            // Signed 8-bit
    let PAR_P8 = twosComp((getUInt8BE(0x9D) << 8) | getUInt8BE(0x9C), 16)   // Signed 16-bit
    let PAR_P9 = twosComp((getUInt8BE(0x9F) << 8) | getUInt8BE(0x9E), 16)   // Signed 16-bit
    let PAR_P10 = getInt8BE(0xA0)                                           // Signed 8-bit

    // Humidity
    let parH1_LSB_parH2_LSB = getUInt8BE(0xE2)
    let PAR_H1 = (getUInt8BE(0xE3) << 4) | (parH1_LSB_parH2_LSB & 0x0F)
    let PAR_H2 = (getUInt8BE(0xE1) << 4) | (parH1_LSB_parH2_LSB >> 4)
    let PAR_H3 = getInt8BE(0xE4)                                            // Signed 8-bit
    let PAR_H4 = getInt8BE(0xE5)                                            // Signed 8-bit
    let PAR_H5 = getInt8BE(0xE6)                                            // Signed 8-bit
    let PAR_H6 = getInt8BE(0xE7)                                            // Signed 8-bit
    let PAR_H7 = getInt8BE(0xE8)                                            // Signed 8-bit

    // Gas resistance
    let PAR_G1 = getInt8BE(0xED)                                            // Signed 8-bit
    let PAR_G2 = twosComp((getUInt8BE(0xEC) << 8) | getUInt8BE(0xEB), 16)   // Signed 16-bit
    let PAR_G3 = getUInt8BE(0xEE)                                           // Unsigned 8-bit
    let RES_HEAT_RANGE = (getUInt8BE(0x02) >> 4) & 0x03
    let RES_HEAT_VAL = twosComp(getUInt8BE(0x00), 8)                        // Signed 8-bit

    // Oversampling rate constants
    const OSRS_1X = 0x01
    const OSRS_2X = 0x02
    const OSRS_4X = 0x03
    const OSRS_8X = 0x04
    const OSRS_16X = 0x05

    // IIR filter coefficient values
    const IIR_0 = 0x00
    const IIR_1 = 0x01
    const IIR_3 = 0x02
    const IIR_7 = 0x03
    const IIR_15 = 0x04
    const IIR_31 = 0x05
    const IIR_63 = 0x06
    const IIR_127 = 0x07

    //Global variables used for storing one copy of value, these are used in multiple locations for calculations
    let bme688InitFlag = false
    let gasInit = false
    let writeBuf = pins.createBuffer(2)

    // Calculated readings of sensor parameters from raw adc readings
    export let tRead = 0
    export let pRead = 0
    export let hRead = 0
    export let gRes = 0
    export let iaqPercent = 0
    export let iaqScore = 0
    export let eCO2Value = 0

    let gBase = 0
    let hBase = 40        // Between 30% & 50% is a widely recognised optimal indoor humidity, 40% is a good middle ground
    let hWeight = 0.25     // Humidity contributes 25% to the IAQ score, gas resistance is 75%
    let tPrev = 0
    let hPrev = 0
    let measTime = 0
    let measTimePrev = 0

    let tRaw = 0    // adc reading of raw temperature
    let pRaw = 0       // adc reading of raw pressure
    let hRaw = 0       // adc reading of raw humidity
    let gResRaw = 0  // adc reading of raw gas resistance
    let gasRange = 0

    // Compensation calculation intermediate variables (used across temperature, pressure, humidity and gas)
    let var1 = 0
    let var2 = 0
    let var3 = 0
    let var4 = 0
    let var5 = 0
    let var6 = 0

    let t_fine = 0                          // Intermediate temperature value used for pressure calculation
    let newAmbTemp = 0
    export let tAmbient = 0       // Intermediate temperature value used for heater calculation
    let ambTempFlag = false

    // Temperature compensation calculation: rawADC to degrees C (integer)
    export function calcTemperature(tempADC: number): void {
        tPrev = tRead

        var1 = (tempADC >> 3) - (PAR_T1 << 1)
        var2 = (var1 * PAR_T2) >> 11
        var3 = ((((var1 >> 1) * (var1 >> 1)) >> 12) * (PAR_T3 << 4)) >> 14
        t_fine = var2 + var3
        newAmbTemp = ((t_fine * 5) + 128) >> 8
        tRead = newAmbTemp / 100     // Convert to floating point with 2 dp
        if (ambTempFlag == false) {
            tAmbient = newAmbTemp
        }
    }

    // Pressure compensation calculation: rawADC to Pascals (integer)
    export function intCalcPressure(pressureADC: number): void {
        var1 = (t_fine >> 1) - 64000
        var2 = ((((var1 >> 2) * (var1 >> 2)) >> 11) * PAR_P6) >> 2
        var2 = var2 + ((var1 * PAR_P5) << 1)
        var2 = (var2 >> 2) + (PAR_P4 << 16)
        var1 = (((((var1 >> 2) * (var1 >> 2)) >> 13) * (PAR_P3 << 5)) >> 3) + ((PAR_P2 * var1) >> 1)
        var1 = var1 >> 18
        var1 = ((32768 + var1) * PAR_P1) >> 15
        pRead = 1048576 - pressureADC
        pRead = ((pRead - (var2 >> 12)) * 3125)

        if (pRead >= (1 << 30)) {
            pRead = Math.idiv(pRead, var1) << 1
        }
        else {
            pRead = Math.idiv((pRead << 1), var1)
        }

        var1 = (PAR_P9 * (((pRead >> 3) * (pRead >> 3)) >> 13)) >> 12
        var2 = ((pRead >> 2) * PAR_P8) >> 13
        var3 = ((pRead >> 8) * (pRead >> 8) * (pRead >> 8) * PAR_P10) >> 17
        pRead = pRead + ((var1 + var2 + var3 + (PAR_P7 << 7)) >> 4)
    }

    // Humidity compensation calculation: rawADC to % (integer)
    // 'tempScaled' is the current reading from the Temperature sensor
    export function intCalcHumidity(humidADC: number, tempScaled: number): void {
        hPrev = hRead

        var1 = humidADC - (PAR_H1 << 4) - (Math.idiv((tempScaled * PAR_H3), 100) >> 1)
        var2 = (PAR_H2 * (Math.idiv((tempScaled * PAR_H4), 100) + Math.idiv(((tempScaled * (Math.idiv((tempScaled * PAR_H5), 100))) >> 6), 100) + ((1 << 14)))) >> 10
        var3 = var1 * var2
        var4 = ((PAR_H6 << 7) + (Math.idiv((tempScaled * PAR_H7), 100))) >> 4
        var5 = ((var3 >> 14) * (var3 >> 14)) >> 10
        var6 = (var4 * var5) >> 1
        hRead = (var3 + var6) >> 12
        hRead = (((var3 + var6) >> 10) * (1000)) >> 12
        hRead = Math.idiv(hRead, 1000)
    }

    // Gas sensor heater target temperature to target resistance calculation
    // 'ambientTemp' is reading from Temperature sensor in degC (could be averaged over a day when there is enough data?)
    // 'targetTemp' is the desired temperature of the hot plate in degC (in range 200 to 400)
    // Note: Heating duration also needs to be specified for each heating step in 'gas_wait' registers
    export function intConvertGasTargetTemp(ambientTemp: number, targetTemp: number): number {
        var1 = Math.idiv((ambientTemp * PAR_G3), 1000) << 8    // Divide by 1000 as we have ambientTemp in pre-degC format (i.e. 2500 rather than 25.00 degC)
        var2 = (PAR_G1 + 784) * Math.idiv((Math.idiv(((PAR_G2 + 154009) * targetTemp * 5), 100) + 3276800), 10)
        var3 = var1 + (var2 >> 1)
        var4 = Math.idiv(var3, (RES_HEAT_RANGE + 4))
        var5 = (131 * RES_HEAT_VAL) + 65536                 // Target heater resistance in Ohms
        let resHeatX100 = ((Math.idiv(var4, var5) - 250) * 34)
        let resHeat = Math.idiv((resHeatX100 + 50), 100)

        return resHeat
    }

    // Gas resistance compensation calculation: rawADC & range to Ohms (integer)
    export function intCalcGasResistance(gasADC: number, gasRange: number): void {
        var1 = 262144 >> gasRange
        //var2 = gasADC - 512
        //var2 = var2 * 3
        //var2 = 4096 + var2
        var2 = 4096 + ((gasADC - 512) * 3)
        let calcGasRes = Math.idiv((10000 * var1), var2)

        gRes = calcGasRes * 100
    }

    // Initialise the BME688, establishing communication, entering initial T, P & H oversampling rates, setup filter and do a first data reading (won't return gas)
    export function bme688Init(): void {
        // Establish communication with BME688
        writeBuf[0] = CHIP_ID
        let chipID = getUInt8BE(writeBuf[0])
        while (chipID != 0x61) {
            chipID = getUInt8BE(writeBuf[0])
        }

        // Do a soft reset
        i2cWrite(RESET, 0xB6)
        basic.pause(1000)

        // Set mode to SLEEP MODE: CTRL_MEAS reg <1:0>
        i2cWrite(CTRL_MEAS, 0x00)

        // Set the oversampling rates for Temperature, Pressure and Humidity
        // Humidity: CTRL_HUM bits <2:0>
        i2cWrite(CTRL_HUM, OSRS_2X)
        // Temperature: CTRL_MEAS bits <7:5>     Pressure: CTRL_MEAS bits <4:2>    (Combine and write both in one command)
        i2cWrite(CTRL_MEAS, (OSRS_2X << 5) | (OSRS_16X << 2))

        // IIR Filter: CONFIG bits <4:2>
        i2cWrite(CONFIG, IIR_3 << 2)

        // Enable gas conversion: CTRL_GAS_1 bit <5>    (although datasheet says <4> - not sure what's going on here...)
        i2cWrite(CTRL_GAS_1, 0x20)      // LOOKS LIKE IT'S BIT 5 NOT BIT 4 - NOT WHAT THE DATASHEET SAYS

        bme688InitFlag = true

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
        if (bme688InitFlag == false) {
            bme688Init()
        }

        // Define the target heater resistance from temperature (Heater Step 0)
        i2cWrite(0x5A, intConvertGasTargetTemp(tAmbient, 300))     // Write the target temperature (300°C) to res_wait_0 register - heater step 0

        // Define the heater on time, converting ms to register code (Heater Step 0) - cannot be greater than 4032ms
        // Bits <7:6> are a multiplier (1, 4, 16 or 64 times)    Bits <5:0> are 1ms steps (0 to 63ms)
        i2cWrite(0x64, 154)        // Write the coded duration (154) of 150ms to gas_wait_0 register - heater step 0

        // Select index of heater step (0 to 9): CTRL_GAS_1 reg <3:0>    (Make sure to combine with gas enable setting already there)
        let gasEnable = (getUInt8BE(writeBuf[0]) & 0x20)
        i2cWrite(CTRL_GAS_1, 0x00 | gasEnable)          // Select heater step 0

        gasInit = true
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
        if (bme688InitFlag == false) {
            bme688Init()
        }

        measTimePrev = measTime       // Store previous measurement time (ms since micro:bit powered on)

        // Set mode to FORCED MODE to begin single read cycle: CTRL_MEAS reg <1:0>    (Make sure to combine with temp/pressure oversampling settings already there)
        let oSampleTP = getUInt8BE(writeBuf[0])
        i2cWrite(CTRL_MEAS, 0x01 | oSampleTP)

        // Check New Data bit to see if values have been measured: MEAS_STATUS_0 bit <7>
        writeBuf[0] = MEAS_STATUS_0
        let newData = (getUInt8BE(writeBuf[0]) & 0x80) >> 7
        while (newData != 1) {
            newData = (getUInt8BE(writeBuf[0]) & 0x80) >> 7
        }

        // Check Heater Stability Status bit to see if gas values have been measured: <4> (heater stability)
        writeBuf[0] = GAS_RES_LSB_0
        let heaterStable = (getUInt8BE(writeBuf[0]) & 0x10) >> 4

        // If there is new data, read temperature ADC registers(this is required for all other calculations)
        tRaw = (getUInt8BE(TEMP_MSB_0) << 12) | (getUInt8BE(TEMP_LSB_0) << 4) | (getUInt8BE(TEMP_XLSB_0) >> 4)

        // Read pressure ADC registers
        pRaw = (getUInt8BE(PRESS_MSB_0) << 12) | (getUInt8BE(PRESS_LSB_0) << 4) | (getUInt8BE(PRESS_XLSB_0) >> 4)

        // Read humidity ADC registers
        hRaw = (getUInt8BE(HUMID_MSB_0) << 8) | getUInt8BE(HUMID_LSB_0)

        // Read gas resistance ADC registers
        gResRaw = (getUInt8BE(GAS_RES_MSB_0) << 2) | (getUInt8BE(GAS_RES_LSB_0) >> 6)   // Shift bits <7:6> right to get LSB for gas resistance

        gasRange = getUInt8BE(GAS_RES_LSB_0) & 0x0F

        measTime = control.millis()      // Capture latest measurement time (ms since micro:bit powered on)

        // Calculate the compensated reading values from the the raw ADC data
        calcTemperature(tRaw)
        intCalcPressure(pRaw)
        intCalcHumidity(hRaw, tRead)
        intCalcGasResistance(gResRaw, gasRange)
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
        if (bme688InitFlag == false) {
            bme688Init()
        }
        if (gasInit == false) {
            setupGasSensor()
        }

        ambTempFlag = false

        let burnInReadings = 0
        let burnInData = 0
        let ambTotal = 0
        show("Setting baselines", 4)
        while (burnInReadings < 60) {               // Measure data and continue summing gas resistance until 60 readings have been taken
            measureData()
            burnInData += gRes
            ambTotal += newAmbTemp
            basic.pause(5000)
            burnInReadings++
        }
        gBase = Math.trunc(burnInData / 60)             // Find the mean gas resistance during the period to form the baseline
        tAmbient = Math.trunc(ambTotal / 60)    // Calculate the ambient temperature as the mean of the 60 initial readings

        ambTempFlag = true

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
        let temperature = tRead
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
        let pressure = pRead
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
        return hRead
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
        if (gasInit == false) {
            clear()
            show("ERROR", 3)
            show("Gas Sensor not setup!", 5)
            return 0
        }
        calcAirQuality()

        let eCO2 = eCO2Value

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
        if (gasInit == false) {
            clear()
            show("ERROR", 3)
            show("Gas Sensor not setup!", 5)
            return 0
        }
        calcAirQuality()

        return iaqPercent
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
        if (gasInit == false) {
            clear()
            show("ERROR", 3)
            show("Gas Sensor not setup!", 5)
            return 0
        }
        calcAirQuality()

        return iaqScore
    }

    // Calculate the Index of Air Quality score from the current gas resistance and humidity readings
    // iaqPercent: 0 to 100% - higher value = better air quality
    // iaqScore: 25 should correspond to 'typically good' air, 250 to 'typically polluted' air
    // airQualityRating: Text output based on the iaqScore
    // Calculate the estimated CO2 value (eCO2)
    export function calcAirQuality(): void {
        let humidityScore = 0
        let gasScore = 0
        let humidityOffset = hRead - hBase         // Calculate the humidity offset from the baseline setting
        let ambTemp = (tAmbient / 100)
        let temperatureOffset = tRead - ambTemp     // Calculate the temperature offset from the ambient temperature
        let humidityRatio = ((humidityOffset / hBase) + 1)
        let temperatureRatio = (temperatureOffset / ambTemp)

        // IAQ Calculations

        if (humidityOffset > 0) {                                       // Different paths for calculating the humidity score depending on whether the offset is greater than 0
            humidityScore = (100 - hRead) / (100 - hBase)
        }
        else {
            humidityScore = hRead / hBase
        }
        humidityScore = humidityScore * hWeight * 100

        let gasRatio = (gRes / gBase)

        if ((gBase - gRes) > 0) {                                            // Different paths for calculating the gas score depending on whether the offset is greater than 0
            gasScore = gasRatio * (100 * (1 - hWeight))
        }
        else {
            // Make sure that when the gas offset and humidityOffset are 0, iaqPercent is 95% - leaves room for cleaner air to be identified
            gasScore = Math.round(70 + (5 * (gasRatio - 1)))
            if (gasScore > 75) {
                gasScore = 75
            }
        }

        iaqPercent = Math.trunc(humidityScore + gasScore)               // Air quality percentage is the sum of the humidity (25% weighting) and gas (75% weighting) scores
        iaqScore = (100 - iaqPercent) * 5                               // Final air quality score is in range 0 - 500 (see BME688 datasheet page 11 for details)

        // eCO2 Calculations

        eCO2Value = 250 * Math.pow(Math.E, (0.012 * iaqScore))      // Exponential curve equation to calculate the eCO2 from an iaqScore input

        // Adjust eCO2Value for humidity and/or temperature greater than the baseline values
        if (humidityOffset > 0) {
            if (temperatureOffset > 0) {
                eCO2Value = eCO2Value * (humidityRatio + temperatureRatio)
            }
            else {
                eCO2Value = eCO2Value * humidityRatio
            }
        }
        else if (temperatureOffset > 0) {
            eCO2Value = eCO2Value * (temperatureRatio + 1)
        }

        // If measurements are taking place rapidly, breath detection is possible due to the sudden increase in humidity (~7-10%)
        // If this increase happens within a 5s time window, 1200ppm is added to the eCO2 value
        // (These values were based on 'breath-testing' with another eCO2 sensor with algorithms built-in)
        //if ((measTime - measTimePrev) <= 5000) {
        //    if ((hRead - hPrev) >= 3) {
        //        eCO2Value = eCO2Value + 1500
        //    }
        //}

        eCO2Value = Math.trunc(eCO2Value)
    }

    ////////////////////////////////
    //           EEPROM           //
    ////////////////////////////////

    let CAT24_I2C_BASE_ADDR = 0x54  // This is A16 = 0, setting A16 = 1 will change address to 0x55

    /**
     * Write a single byte to a specified address
     * @param data is the data which will be written (a single byte)
     * @param addr is the EEPROM address, eg: 0
     */
    export function writeByte(data: any, addr: number): void {
        if (addr < 0) {
            addr = 0
        }
        if (addr > 131071) {
            addr = 131071
        }

        let buf = pins.createBuffer(3);                             // Create buffer for holding addresses & data to write
        let i2cAddr = 0

        if ((addr >> 16) == 0) {                                    // Select the required address (A16 as 0 or 1)
            i2cAddr = CAT24_I2C_BASE_ADDR                           // A16 = 0
        }
        else {
            i2cAddr = CAT24_I2C_BASE_ADDR + 1                       // A16 = 1
        }

        buf[0] = (addr >> 8) & 0xFF                                 // Memory location bits a15 - a8
        buf[1] = addr & 0xFF                                        // Memory location bits a7 - a0
        buf[2] = data                                               // Store the data in the buffer
        pins.i2cWriteBuffer(i2cAddr, buf, false)                    // Write the data to the correct address

        buf = null // Try to free up memory
    }

    // Split the EEPROM pages in half to make 128 byte blocks
    // Write to a single block
    export function writeBlock(data: string, block: number): void {
        let dataLength = data.length
        let buf = pins.createBuffer(dataLength + 2);                  // Create buffer for holding addresses & data to write
        let i2cAddr = 0
        let startAddr = block * 128

        if ((startAddr >> 16) == 0) {                               // Select the required address (A16 as 0 or 1)
            i2cAddr = CAT24_I2C_BASE_ADDR                           // A16 = 0
        }
        else {
            i2cAddr = CAT24_I2C_BASE_ADDR + 1                       // A16 = 1
        }

        buf[0] = (startAddr >> 8) & 0xFF                            // Memory location bits a15 - a8
        buf[1] = startAddr & 0xFF                                   // Memory location bits a7 - a0

        for (let i = 0; i < dataLength; i++) {
            let ascii = data.charCodeAt(i)
            buf[i + 2] = ascii                                        // Store the data in the buffer
        }

        pins.i2cWriteBuffer(i2cAddr, buf, false)                    // Write the data to the correct address

        buf = null // Try to free up memory
    }

    // Read a data entry from a single block
    export function readBlock(block: number): string {
        let startAddr = block * 128
        let byte = 0
        let entry = ""

        for (byte = 0; byte < 127; byte++) {
            entry = entry + String.fromCharCode(readByte(startAddr + byte))
        }

        entry = entry.substr(0, entry.indexOf("£"))

        return entry
    }

    /**
     * Read a single byte from a specified address
     * @param addr is EEPROM address, eg: 0
     */
    export function readByte(addr: number): number {
        if (addr < 0) {
            addr = 0
        }
        if (addr > 131071) {
            addr = 131071
        }

        let writeBuf = pins.createBuffer(2)                         // Create a buffer for holding addresses
        let readBuf = pins.createBuffer(1)                          // Create a buffer for storing read data
        let i2cAddr = 0

        if ((addr >> 16) == 0) {                                    // Select the required address (A16 as 0 or 1)
            i2cAddr = CAT24_I2C_BASE_ADDR                           // A16 = 0
        }
        else {
            i2cAddr = CAT24_I2C_BASE_ADDR + 1                       // A16 = 1
        }

        writeBuf[0] = (addr >> 8) & 0xFF                            // Memory location bits a15 - a8
        writeBuf[1] = addr & 0xFF                                   // Memory location bits a7 - a0
        pins.i2cWriteBuffer(i2cAddr, writeBuf, false)               // Write to the address to prepare for read operation

        readBuf = pins.i2cReadBuffer(i2cAddr, 1, false)             // Read the data at the correct address into the buffer
        let readData = readBuf[0]                                   // Store the data from the buffer as a variable

        return readData                                             // Return the variable so the data can be accessed
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
        writeBlock(kitronikHeader, 21)

        basic.pause(100)

        let headings = "Date" + delimiter + "Time" + delimiter + "Temperature" + delimiter + "Pressure" + delimiter + "Humidity" + delimiter + "IAQ Score" + delimiter + "eCO2" + delimiter + "Light" + delimiter + "\r\n£"

        writeBlock(headings, 23)

        writeTitles = true

        entryNum = (readByte(12 * 128) << 8) | (readByte((12 * 128) + 1))              // Read from block 12 how many entries have been stored so far
        entryNum = entryNum & 0xFFF
    }

    /**
     * Input information about the user and project in string format.
     * @param name of person carrying out data logging
     * @param subject area of the data logging project
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=80 blockGap=8
    //% blockId=kitronik_air_quality_project_info
    //% block="add project info: Name %name|Subject %subject"
    //% inlineInputMode=inline
    export function addProjectInfo(name: string, subject: string): void {
        let projectInfo = "Name: " + name + "\r\n" + "Subject: " + subject + "\r\n£"

        writeBlock(projectInfo, 22)
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

        calcAirQuality()

        dataEntry = readDate() + delimiter + readTime() + delimiter + readTemperature(TemperatureUnitList.C) + delimiter + readPressure(PressureUnitList.Pa) + delimiter + hRead + delimiter + iaqScore + delimiter + eCO2Value + delimiter + input.lightLevel() + delimiter

        writeBlock(dataEntry + "\r\n£", firstDataBlock + entryNum)

        basic.pause(100)

        // Store the current entry number at first bytes of block 12
        //writeBlock(convertToText(entryNum), 12)     // More memory efficient that writing the bytes separately
        let storedEntryNum = entryNum | 0x1000
        let buf = pins.createBuffer(4)
        buf[0] = 0x06
        buf[1] = 0x00
        buf[2] = storedEntryNum >> 8
        buf[3] = storedEntryNum & 0xFF
        pins.i2cWriteBuffer(0x54, buf, false)

        //writeByte((storedEntryNum >> 8), (12 * 128))              // Entry Number High Byte
        //writeByte((storedEntryNum & 0xFF), ((12 * 128) + 1))      // Entry Number Low Byte

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
                i2cAddr = CAT24_I2C_BASE_ADDR                           // A16 = 0
            }
            else {
                i2cAddr = CAT24_I2C_BASE_ADDR + 1                       // A16 = 1
            }

            blankBlock[0] = (addr >> 8) & 0xFF                            // Memory location bits a15 - a8
            blankBlock[1] = addr & 0xFF                                   // Memory location bits a7 - a0

            pins.i2cWriteBuffer(i2cAddr, blankBlock, false)                    // Write the data to the correct address
            basic.pause(5)
        }

        basic.pause(100)
        let buf = pins.createBuffer(4)
        buf[0] = 0x06
        buf[1] = 0x00
        buf[2] = 0x00
        buf[3] = 0x00
        pins.i2cWriteBuffer(0x54, buf, false)

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

        header = readBlock(21)
        serial.writeString(header)      // Send Kitronik Header
        info = readBlock(22)
        serial.writeString(info)        // Send Project Info
        titles = readBlock(23)
        serial.writeString(titles)      // Send Data Column Headings

        if (dataFull) {
            for (block = firstDataBlock; block < 1024; block++) {
                data = readBlock(block)
                serial.writeString(data)
            }
        }
        else {
            let readLastEntry = (readByte(12 * 128) << 8) | (readByte((12 * 128) + 1))              // Read from block 12 how many entries have been stored so far
            lastEntry = readLastEntry & 0xFFF
            show(lastEntry, 4)
            for (block = firstDataBlock; block < (firstDataBlock + lastEntry + 1); block++) {
                data = readBlock(block)
                serial.writeString(data)
            }
        }
    }
}
