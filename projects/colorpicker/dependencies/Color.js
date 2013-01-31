// Color.js
// Utility class for converting between color spaces.
// INFO 343, Autumn 2012
// Morgan Doocy

var INCLUDE_HASH_IN_HEX = true;
var UPPERCASE_HEX = false;

var Color = function() {
	this.r = null;
	this.g = null;
	this.b = null;

	this.h = null;
	this.s = null;
	this.l = null;

	this.hex = null;

	if (arguments.length == 1) {
		this.setHex(arguments[0]);
	} else if (arguments.length == 3) {
		var a = arguments[0];
		var b = arguments[1];
		var c = arguments[2];
		if (parseInt(a) > 255 || (typeof b == "string" && b.indexOf('%') != -1) || (typeof c == "string" && c.indexOf('%') != -1)) {
			this.setHSL(a, b, c);
		} else {
			this.setRGB(a, b, c);
		}
	}
};

Color.prototype.setHex = function(hex) {
	if (hex[0] == '#')
		hex = hex.substring(1);
	if (hex.length == 3)
		hex = '' + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	
	var matches = hex.match(/[\da-f]{2}/ig);
	var r = parseInt(matches[0], 16);
	var g = parseInt(matches[1], 16);
	var b = parseInt(matches[2], 16);
	
	this.setRGB(r, g, b);
}

Color.prototype.setHexOnly = function(r, g, b) {
	var r_ = zeroPad(parseInt(r).toString(16));
	var g_ = zeroPad(parseInt(g).toString(16));
	var b_ = zeroPad(parseInt(b).toString(16));
	
	this.hex = '' + r_ + g_ + b_;
	this.hex = UPPERCASE_HEX ? this.hex.toUpperCase() : this.hex.toLowerCase();
	
	if (INCLUDE_HASH_IN_HEX)
		this.hex = '#' + this.hex;
	
	function zeroPad(val) {
		return val.length == 1 ? '0' + val : val;
	}
}

Color.prototype.setRGBOnly = function(r, g, b) {
	this.r = parseInt(r);
	this.g = parseInt(g);
	this.b = parseInt(b);
}

Color.prototype.setRGB = function(r, g, b) {
	this.setRGBOnly(r, g, b);
	this.setHexOnly(r, g, b);
	this.setHSLOnlyByRGB(r, g, b);
}

Color.prototype.setHSLOnlyByRGB = function(r, g, b) {
	var r_ = (r / 255);
	var g_ = (g / 255);
	var b_ = (b / 255);
	
	var min = Math.min(r_, g_, b_);
	var max = Math.max(r_, g_, b_);
	var del = max - min;
	
	this.l = (max + min) / 2;
	
	if (del == 0) {
		this.h = 0;
		this.s = 0;
	} else {
		if (this.l < 0.5)
			this.s = del / (max + min);
		else
			this.s = del / (2 - max - min);
   	
		r_del = (((max - r_) / 6) + (del / 2)) / del;
		g_del = (((max - g_) / 6) + (del / 2)) / del;
		b_del = (((max - b_) / 6) + (del / 2)) / del;
   	
		if (r_ == max)
			this.h = b_del - g_del;
		else if (g_ == max)
			this.h = (1 / 3) + r_del - b_del;
		else if (b_ == max)
			this.h = (2 / 3) + g_del - r_del;
   	
		if (this.h < 0)
			this.h += 1;
		if (this.h > 1)
			this.h -= 1;
	}
	
	this.h *= 360;
	this.s *= 100;
	this.l *= 100;
}

Color.prototype.setHSLOnly = function(h, s, l) {
	this.h = parseInt(h) % 360;
	this.s = parseInt(s);
	this.l = parseInt(l);
	if (this.h < 0)
		this.h += 360;
}

Color.prototype.setRGBOnlyByHSL = function(h, s, l) {
	var h_ = this.h / 360;
	var s_ = this.s / 100;
	var l_ = this.l / 100;
	
	if (s_ == 0) {
		this.r = Math.round(l_ * 255);
		this.g = Math.round(l_ * 255);
		this.b = Math.round(l_ * 255);
	} else {
		var a, b;
		if (l_ < 0.5)
			b = l_ * (1 + s_);
		else
			b = (l_ + s_) - (s_ * l_);
   	
		a = 2 * l_ - b;
   	
		this.r = Math.round(255 * hue2rgb(a, b, h_ + (1 / 3)));
		this.g = Math.round(255 * hue2rgb(a, b, h_));
		this.b = Math.round(255 * hue2rgb(a, b, h_ - (1 / 3)));
	}

	function hue2rgb(v1, v2, vH) {
		if (vH < 0) vH += 1;
		if (vH > 1) vH -= 1;
		if ((6 * vH) < 1) return (v1 + (v2 - v1) * 6 * vH);
		if ((2 * vH) < 1) return (v2);
		if ((3 * vH) < 2) return (v1 + (v2 - v1) * ((2 / 3) - vH) * 6);
		return v1;
	}
}

Color.prototype.setHSL = function(h, s, l) {
	this.setHSLOnly(h, s, l);
	this.setRGBOnlyByHSL(h, s, l);
	this.setHexOnly(this.r, this.g, this.b);
}