import React, { useState } from 'react';
import './App.css';
import colorNameList from 'color-name-list';

function App() {
  const [inputColor, setInputColor] = useState('#3498db');
  const [similarColors, setSimilarColors] = useState([]);
  const [error, setError] = useState('');

  const colorNameToHex = (name) => {
    const lowerName = name.toLowerCase().trim();
    const color = colorNameList.find(c => c.name.toLowerCase() === lowerName);
    return color ? color.hex : null;
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    const clamp = (val) => Math.max(0, Math.min(255, Math.round(val)));
    return "#" + [r, g, b].map(x => {
      const hex = clamp(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  const generateSimilarColors = (color) => {
    const rgb = hexToRgb(color);
    if (!rgb) return [];

    const colors = [];
    const seen = new Set();
    
    const addColor = (name, hex) => {
      if (!seen.has(hex)) {
        seen.add(hex);
        colors.push({ name, hex });
      }
    };

    const variations = [
      { name: 'Lighter', factor: 1.3 },
      { name: 'Light', factor: 1.15 },
      { name: 'Original', factor: 1 },
      { name: 'Dark', factor: 0.85 },
      { name: 'Darker', factor: 0.7 },
    ];

    variations.forEach(({ name, factor }) => {
      addColor(name, rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor));
    });

    // Add some hue variations
    const hueShifts = [-30, -15, 15, 30];
    hueShifts.forEach(shift => {
      const shifted = shiftHue(rgb, shift);
      addColor(`Hue ${shift > 0 ? '+' : ''}${shift}°`, rgbToHex(shifted.r, shifted.g, shifted.b));
    });

    // Add saturation variations
    const satVariations = [
      { name: 'More Saturated', factor: 1.3 },
      { name: 'Less Saturated', factor: 0.7 }
    ];

    satVariations.forEach(({ name, factor }) => {
      const adjusted = adjustSaturation(rgb, factor);
      addColor(name, rgbToHex(adjusted.r, adjusted.g, adjusted.b));
    });

    return colors;
  };

  const shiftHue = (rgb, degrees) => {
    const { r, g, b } = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
    }
    h = (h * 60 + degrees + 360) % 360;

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return hsvToRgb(h, s, v / 255);
  };

  const adjustSaturation = (rgb, factor) => {
    const { r, g, b } = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
    }
    h = h * 60;

    const s = max === 0 ? 0 : (delta / max) * factor;
    const v = max / 255;

    return hsvToRgb(h, Math.min(1, s), v);
  };

  const hsvToRgb = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return {
      r: (r + m) * 255,
      g: (g + m) * 255,
      b: (b + m) * 255
    };
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    setInputColor(color);
    setSimilarColors(generateSimilarColors(color));
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputColor(input);
    setError('');
    
    // Check if it's a hex color
    if (/^#[0-9A-F]{6}$/i.test(input)) {
      setSimilarColors(generateSimilarColors(input));
    } 
    // Check if it's a valid color name
    else if (input.length > 2 && !/^#/.test(input)) {
      const hex = colorNameToHex(input);
      if (hex) {
        setSimilarColors(generateSimilarColors(hex));
        setError('');
      } else {
        setSimilarColors([]);
        setError('Color name not recognized. Try names like "red", "blue", "coral", etc.');
      }
    }
  };

  React.useEffect(() => {
    setSimilarColors(generateSimilarColors(inputColor));
  }, []);

  return (
    <div className="App">
      <div className="container">
        <h1>Color Similarity Finder</h1>
        <p className="subtitle">Enter a hex code or color name to see similar shades and variations</p>
        
        <div className="input-section">
          <div className="color-input-group">
            <input
              type="color"
              value={inputColor}
              onChange={handleColorChange}
              className="color-picker"
            />
            <input
              type="text"
              value={inputColor}
              onChange={handleInputChange}
              placeholder="e.g., #3498db or 'blue'"
              className="color-text-input"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="colors-grid">
          {similarColors.map((color, index) => (
            <div key={index} className="color-card">
              <div
                className="color-preview"
                style={{ backgroundColor: color.hex }}
              ></div>
              <div className="color-info">
                <span className="color-name">{color.name}</span>
                <span className="color-hex">{color.hex}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
