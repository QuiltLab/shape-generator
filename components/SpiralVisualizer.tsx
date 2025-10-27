'use client';

import { useState, useEffect, useRef } from 'react';
import { generateDoyleCircles, Circle } from '@/lib/spiralGenerator';

interface Preset {
  name: string;
  p: number;
  q: number;
  rows: number;
  description: string;
}

const PRESETS: Preset[] = [
  { name: 'Classic', p: 3, q: 7, rows: 8, description: 'Beautiful balanced spiral' },
  { name: 'Flower', p: 5, q: 12, rows: 6, description: 'Delicate flower pattern' },
  { name: 'Dense', p: 9, q: 10, rows: 10, description: 'Tightly packed circles' },
  { name: 'Radial', p: 2, q: 5, rows: 10, description: 'Strong radial symmetry' },
  { name: 'Mandala', p: 7, q: 13, rows: 7, description: 'Mandala-like pattern' },
];

export default function SpiralVisualizer() {
  const [p, setP] = useState(3);
  const [q, setQ] = useState(7);
  const [rows, setRows] = useState(8);
  const [prunePercentile, setPrunePercentile] = useState(0.7);
  const [baseRadius, setBaseRadius] = useState(1.0);
  const [strokeWidth, setStrokeWidth] = useState(0.8);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#2b2b2b');
  const [circles, setCircles] = useState<Circle[]>([]);
  const [error, setError] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    generateSpiral();
  }, [p, q, rows, prunePercentile]);

  const generateSpiral = () => {
    try {
      setError('');
      const result = generateDoyleCircles(p, q, rows, undefined, undefined, prunePercentile);
      setCircles(result.circles);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate spiral');
      setCircles([]);
    }
  };

  const getSVGBounds = () => {
    if (circles.length === 0) return { minX: -100, maxX: 100, minY: -100, maxY: 100, width: 200, height: 200 };

    const padding = 40;
    const scaledCircles = circles.map(c => ({
      cx: c.cx * baseRadius,
      cy: c.cy * baseRadius,
      radius: c.radius * baseRadius
    }));

    const minX = Math.min(...scaledCircles.map(c => c.cx - c.radius)) - padding;
    const maxX = Math.max(...scaledCircles.map(c => c.cx + c.radius)) + padding;
    const minY = Math.min(...scaledCircles.map(c => c.cy - c.radius)) - padding;
    const maxY = Math.max(...scaledCircles.map(c => c.cy + c.radius)) + padding;

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  const bounds = getSVGBounds();
  const viewBoxWidth = bounds.width / zoom;
  const viewBoxHeight = bounds.height / zoom;
  const viewBoxX = bounds.minX + pan.x + (bounds.width - viewBoxWidth) / 2;
  const viewBoxY = bounds.minY + pan.y + (bounds.height - viewBoxHeight) / 2;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(10, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const applyPreset = (preset: Preset) => {
    setP(preset.p);
    setQ(preset.q);
    setRows(preset.rows);
  };

  const exportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `doyle-spiral-${p}-${q}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Control Panel */}
      <div className="w-80 bg-gray-800 text-white p-6 overflow-y-auto shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Doyle Spiral
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Presets */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 text-gray-300">Presets</h2>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-colors"
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-5 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              p: {p}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              q: {q}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={q}
              onChange={(e) => setQ(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rows: {rows}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Prune: {(prunePercentile * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={prunePercentile}
              onChange={(e) => setPrunePercentile(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Base Radius: {baseRadius.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={baseRadius}
              onChange={(e) => setBaseRadius(Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Stroke Width: {strokeWidth.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Stroke Color</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fill Color</label>
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Background</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={resetView}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors"
          >
            Reset View
          </button>
          <button
            onClick={exportSVG}
            className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium transition-colors"
          >
            Export SVG
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 text-xs text-gray-400">
          <p className="mb-2"><strong>Circles:</strong> {circles.length}</p>
          <p className="mb-2"><strong>Zoom:</strong> {zoom.toFixed(2)}x</p>
          <p className="mb-4"><strong>Tip:</strong> Scroll to zoom, drag to pan</p>
          <p className="text-[10px] leading-relaxed">
            Doyle spirals are mathematical patterns formed by circles that touch each other.
            Adjust p and q to create different spiral configurations.
          </p>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor }}
      >
        <svg
          ref={svgRef}
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full cursor-move"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g>
            {circles.map((circle, idx) => {
              const cx = circle.cx * baseRadius;
              const cy = circle.cy * baseRadius;
              const r = circle.radius * baseRadius;
              const adjustedCy = bounds.height - (cy - bounds.minY) + bounds.minY;

              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={adjustedCy}
                  r={r}
                  stroke={strokeColor}
                  fill={fillColor}
                  strokeWidth={strokeWidth}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
