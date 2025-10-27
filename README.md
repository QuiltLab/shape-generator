# Doyle Spiral Generator

An interactive web application for creating and exploring beautiful Doyle spiral patterns. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Interactive Visualization
- **Real-time rendering** of Doyle spirals with instant parameter updates
- **Zoom and pan** controls - scroll to zoom, drag to pan around the canvas
- **SVG-based** rendering for crisp, scalable graphics

### Customization Controls
- **Parameters**
  - `p` and `q`: Define the spiral configuration (1-20)
  - `rows`: Control the depth/complexity of the spiral (1-20)
  - `prune`: Adjust the circular boundary (10-100%)

- **Visual Styling**
  - Base radius adjustment
  - Stroke width control
  - Custom stroke, fill, and background colors

### User-Friendly Features
- **5 Preset Patterns**: Classic, Flower, Dense, Radial, and Mandala
- **Export to SVG**: Download your spiral as a high-quality SVG file
- **Reset View**: Instantly return to default zoom/pan
- **Live Statistics**: See circle count and current zoom level

### Mathematical Accuracy
- Faithful implementation of Doyle spiral mathematics
- Newton-Raphson numerical solver for precise calculations
- Distance-based pruning for balanced circular patterns

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

Doyle spirals are mathematical patterns formed by circles that touch each other in a specific way. The parameters `p` and `q` determine the rotational structure of the spiral:

- Each spiral has `q` arms rotating around the center
- The ratio `p/q` controls how the circles grow and rotate
- Different `p` and `q` values create wildly different patterns

## Controls

- **Scroll Wheel**: Zoom in/out
- **Click + Drag**: Pan around the canvas
- **Sliders**: Adjust parameters in real-time
- **Color Pickers**: Customize appearance
- **Preset Buttons**: Try different configurations instantly

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **SVG** - Scalable vector graphics

## Credits

Based on Robin Houston's doyle-spirals project (MIT License)
https://github.com/robinhouston/doyle-spirals
