/*
    Cody Stebbins (mail@codystebbins.com)
    4 November 2012
    INFO 343 B, Autumn 2012
    Mini Project - Color Picker
    jQuery/JavaScript file for Color Picker
*/

// encapsulate colorpicker.js within self executing anonymous method to prevent
// global namespace conflicts. only leak out appropriate methods into
// window.cstebbins.Colr
(function() {
    "use strict" // enable ECMAScript 5 strict mode

var // namespace object to be leaked into window.cstebbins.Colr
    Colr = {},
    // an array containing four Color.js objects representing 
    // the current scheme
    colors = [       
        new Color(), 
        new Color(),
        new Color(),
        new Color()
    ],
    // an object mapping scheme name to scheme select option text
    schemes = {      
        mono: "Mono",
        comp: "Complementary",
        triad: "Triad",
        tetrad: "Tetrad"
    },
    // an object mapping unit name to unit select option text
    units = {        
        hex: "Hex",
        rgb: "RGB (Red, Green, Blue)",
        hsl: "HSL (Hue, Saturation, Lightness)"
    },
    // an object containing all of the ui jQuery elements
    elems,           
    // default delay in ms for calling updateColor after changing any 
    // of the color text inputs
    defaultDelay = 300;

// initializes the Colr object with the correct jQuery objects and handlers
Colr.initialize = function () {
    var i = 0;

    // stores the ui elements in the elems object
    elems = {
        colorpicker: $("#colorpicker"),
        hsl: $('#hsl input'),
        rgb: $('#rgb input'),
        hex: $('#hex input'),
        modes: $('#modes select'),
        scheme: $('#scheme input'),
        preview: $('#preview')
    };

    // selects all text in rgb, hsl, hex, scheme inputs upon focus
    elems.hsl.focus(selectText);
    elems.rgb.focus(selectText);
    elems.hex.focus(selectText);
    elems.scheme.focus(selectText);

    // create rgb object with separate fields
    elems.rgb = {
        r: elems.rgb.eq(0),
        g: elems.rgb.eq(1),
        b: elems.rgb.eq(2)
    };

    // create hsl object with separate fields
    elems.hsl = {
        h: elems.hsl.eq(0),
        s: elems.hsl.eq(1),
        l: elems.hsl.eq(2)
    };

    // create modes object with separate fields
    elems.modes = {
        scheme: elems.modes.eq(0),
        display: elems.modes.eq(1)
    };

    // create preview object with separate fields
    elems.preview = [
        elems.preview,
        elems.preview.find('#masthead'),
        elems.preview.find('.post'),
        elems.preview.find('aside')
    ];

    // setup farbtastic colorpicker handling
    elems.colorpicker.farbtastic(updateHex);

    // setup hex input handlign
    elems.hex.keyup(function () {
        var hex = $(this).val();

        delay(function () {
            updateHex(hex);     
        }, defaultDelay);
    });

    // setup rgb input handling
    elems.rgb.r.keyup(function () {
        var color = {
            r: $(this).val()
        };

        delay(function () {
            updateRgb(color);     
        }, defaultDelay);
    });
    elems.rgb.g.keyup(function () {
        var color = {
            g: $(this).val()
        };

        delay(function () {
            updateRgb(color);     
        }, defaultDelay);
    });
    elems.rgb.b.keyup(function () {
        var color = {
            b: $(this).val()
        };

        delay(function () {
            updateRgb(color);     
        }, defaultDelay);
    });

    // setup hsl input handling
    elems.hsl.h.keyup(function () {
        var color = {
            h: $(this).val()
        };

        delay(function () {
            updateHsl(color);     
        }, defaultDelay);
    });
    elems.hsl.s.keyup(function () {
        var color = {
            s: $(this).val()
        };
        
        delay(function () {
            updateHsl(color);     
        }, defaultDelay);
    });
    elems.hsl.l.keyup(function () {
        var color = {
            l: $(this).val()
        };
        
        delay(function () {
            updateHsl(color);     
        }, defaultDelay);
    });

    setupModeSelect(elems.modes.scheme, schemes);
    setupModeSelect(elems.modes.display, units);

    // initialize with default color
    var color = colors[0];
    color.setHex('#a86cea');
    updateColor(color);
};


// dynamically creates an option dom element for each mode in mode and 
// adds the option element to the given mode object. also binds the
// given mode to update colors on change.
//
// mode - jQuery object of a <select> to have modes options appended
// modes - object mapping a key to a string value containing the text
//         for an option element to be appended to mode
function setupModeSelect(mode, modes) {
    mode.change(function () {
        updateColor(colors[0]);
    });
    $.each(modes, function(index, modeStr) {
        mode
            .append($("<option></option>")
            .attr("value", modeStr)
            .text(modeStr));
    });  
}

// updates each element of the Colr ui with the given color.
//
// color - Color.js object of the new user selected color
function updateColor(color) {
    var display = elems.modes.display.val(),
        i;

    $.farbtastic(elems.colorpicker).setColor(color.hex);

    // update rgb inputs
    elems.rgb.r.val(color.r);
    elems.rgb.g.val(color.g);
    elems.rgb.b.val(color.b);

    // update hsl inputs
    elems.hsl.h.val(color.h);
    elems.hsl.s.val(color.s);
    elems.hsl.l.val(color.l);

    // update hex input
    elems.hex.val(color.hex);

    generateScheme(color, elems.modes.scheme.val());

    // update scheme inputs
    for (i = 0; i < colors.length; i += 1) {
        color = colors[i];
        elems.scheme.eq(i)
            .val(colorToString(display, color))
            .css({
                'background-color': color.hex
            });
        elems.preview[i].css({
            'background-color': color.hex
        });
    }
}

// calls upon the appropriate helper function to generate a set of colors
// that matches the properties of the given scheme applied to the given color.
//
// color - Color.js object of the given color to apply the given scheme to
// scheme - String of the given scheme. Must be a value within schemes
function generateScheme(color, scheme) {
    if (scheme === schemes.mono) {
        mono(color, colors);
    } else if (scheme === schemes.comp) {
        comp(color, colors);
    } else if (scheme === schemes.triad) {
        triad(color, colors);
    } else if (scheme === schemes.tetrad) {
        tetrad(color, colors);
    }
}

// returns the string representation of the given color based on the given unit
// 
// unit - String of the given unit. Must be a value within units
// color - Color.js object of the given color to be output to string
function colorToString(unit, color) {
    if (unit === units.hex) {
        return color.hex;
    } else if (unit === units.rgb) {
        return "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
    } else if (unit === units.hsl) {
        return "hsl(" + color.h + ", " + color.s + ", " + color.l + ")";
    }
}

// converts given hex value hexColor into a Color.js object and calls 
// updateColor with the Color.js object.
//
// hexColor - String of new hex color 
function updateHex(hexColor) {
    var color = colors[0];
    
    color.setHex(hexColor);
    updateColor(color);
}

// converts given rgb object into a Color.js object and calls 
// updateColor with the Color.js object.
//
// rgbColor - an object that may contain the properties r, g, b which map to
//            the corresponding to the change in rgb
function updateRgb(rgbColor) {
    var color = colors[0];

    rgbColor.r = rgbColor.r || color.r;
    rgbColor.g = rgbColor.g || color.g;
    rgbColor.b = rgbColor.b || color.b;

    color.setRGB(rgbColor.r, rgbColor.g, rgbColor.b);

    updateColor(color);
}

// converts given hsl object into a Color.js object and calls 
// updateColor with the Color.js object.
//
// hslColor - an object that may contain the properties h, s, l which map to
//            the corresponding to the change in hsl
function updateHsl(hslColor) {
    var color = colors[0];

    hslColor.h = hslColor.h || color.h;
    hslColor.s = hslColor.s || color.s;
    hslColor.l = hslColor.l || color.l;

    color.setHSL(hslColor.h, hslColor.s, hslColor.l);

    updateColor(color);
}

// applies the mono color scheme to the given seed to the four Color.js
// objects in the given colors array.
//
// seed - Color.js object to apply color scheme to
// colors - array containing four Color.js objects to contain the 
//          results of applying the color scheme to seed
function mono(seed, colors) {
    colors[0] = seed;
    colors[1].setHSL(seed.h, seed.s, seed.l + 10);
    colors[2].setHSL(seed.h, seed.s, seed.l + 20);
    colors[3].setHSL(seed.h, seed.s, seed.l + 30);
}

// applies the complementary color scheme to the given seed to the four Color.js
// objects in the given colors array.
//
// seed - Color.js object to apply color scheme to
// colors - array containing four Color.js objects to contain the 
//          results of applying the color scheme to seed
function comp(seed, colors) {
    colors[0] = seed;
    colors[1].setHSL(seed.h, seed.s, seed.l + 10);
    colors[2].setHSL(seed.h, seed.s, seed.l + 20);
    colors[3].setHSL(seed.h + 180, seed.s, seed.l);
}

// applies the triad color scheme to the given seed to the four Color.js
// objects in the given colors array.
//
// seed - Color.js object to apply color scheme to
// colors - array containing four Color.js objects to contain the 
//          results of applying the color scheme to seed
function triad(seed, colors) {
    colors[0] = seed;
    colors[1].setHSL(seed.h + 120, seed.s, seed.l);
    colors[2].setHSL(seed.h + 240, seed.s, seed.l);
    colors[3].setHSL(seed.h, seed.s, seed.l - 10);
}

// applies the tetrad color scheme to the given seed to the four Color.js
// objects in the given colors array.
//
// seed - Color.js object to apply color scheme to
// colors - array containing four Color.js objects to contain the 
//          results of applying the color scheme to seed
function tetrad(seed, colors) {
    colors[0] = seed;
    colors[1].setHSL(seed.h + 90, seed.s, seed.l);
    colors[2].setHSL(seed.h + 180, seed.s, seed.l);
    colors[3].setHSL(seed.h + 270, seed.s, seed.l);
}

// binding function for automatically selecting all the text within 
// a jQuery text object
function selectText() {
    var $this = $(this);

    $this.select();

    // Work around Chrome's little problem
    $this.mouseup(function() {
        // Prevent further mouseup intervention
        $this.unbind("mouseup");
        return false;
    });
}

// a helper function used to delay the updateColor call upon 
// changing any of the text color inputs
var delay = (function () { 
                var timer = 0;
                return function(callback, ms){
                    clearTimeout (timer);
                    timer = setTimeout(callback, ms);
                };
            })();

// leak into global namespace
window.cstebbins = window.cstebbins || {};
window.cstebbins.Colr = Colr;
})();

$(document).ready(cstebbins.Colr.initialize);
