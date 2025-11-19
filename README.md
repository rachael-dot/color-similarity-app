# Color Similarity App

A React application that displays similar colors when a color is input. The app generates variations including lighter/darker shades, hue shifts, and saturation adjustments.

## Features

- 🎨 Interactive color picker and text input
- 🌈 Generates 11 unique similar color variations
- ✨ Lightness variations (Lighter, Light, Dark, Darker)
- 🔄 Hue shifts (-30°, -15°, +15°, +30°)
- 💫 Saturation adjustments (More/Less Saturated)
- 🚫 No duplicate colors in recommendations
- 📱 Responsive design
- ✅ Comprehensive test coverage (88.67%)

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm start
```
Runs the app at [http://localhost:3000](http://localhost:3000)

### Build
```bash
npm run build
```
Creates an optimized production build in the `build` folder.

### Test
```bash
npm test
```
Runs the test suite.

```bash
npm test -- --coverage
```
Runs tests with code coverage report.

## Test Coverage

- Overall: 88.67% statement coverage
- App.js: 90.38% coverage
- 22 passing tests

## Technologies

- React 19.2.0
- React Scripts 5.0.1
- Testing Library
- CSS3

## How It Works

The app uses HSV (Hue, Saturation, Value) color space conversions to generate similar colors:
1. Converts input hex color to RGB
2. Generates variations by adjusting brightness, hue, and saturation
3. Filters out duplicate colors
4. Displays each unique color with its name and hex code

## License

ISC
