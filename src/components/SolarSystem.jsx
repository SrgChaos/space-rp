import React, { useState, useEffect, useRef } from 'react';

const SolarSystem = ({ data, fleets }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [transform, setTransform] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 0.000001 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Threshold for showing moons (adjust as needed)
  const MOON_VISIBILITY_THRESHOLD = 0.000005;
  const FLEET_CLUSTERING_THRESHOLD = 0.005;

  console.log(fleets);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      setTransform(prev => ({ ...prev, x: window.innerWidth / 2, y: window.innerHeight / 2 }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateInitialScale = () => {
    const maxDistance = data.reduce((max, planet) => {
      const distance = Math.sqrt(planet.x * planet.x + planet.y * planet.y);
      return Math.max(max, distance);
    }, 0);
    return Math.min(dimensions.width, dimensions.height) / (maxDistance * 3);
  };

  const clusterFleets = () => {
    if (transform.scale >= FLEET_CLUSTERING_THRESHOLD) {
      return fleets.map(fleet => ({
        ...fleet,
        fleetNames: [fleet.FleetName]
      }));
    }

    const clusteredFleets = [];
    const clusterThreshold = 10 / transform.scale

    fleets.forEach(fleet => {
      const existingCluster = clusteredFleets.find(clusterFleet => 
        Math.abs(clusterFleet.Xcor - fleet.Xcor) < clusterThreshold &&
        Math.abs(clusterFleet.Ycor - fleet.Ycor) < clusterThreshold
      );

      if(existingCluster) {
        existingCluster.fleetNames.push(fleet.FleetName);
      } else {
        clusteredFleets.push({
          ...fleet,
          fleetNames: [fleet.FleetName]
        });
      }
    });

    return clusteredFleets;
  }

  useEffect(() => {
    const initialScale = calculateInitialScale();
    setTransform(prev => ({ ...prev, scale: initialScale }));
  }, [data, dimensions]);

  const handleWheel = (e) => {


    // Get cursor position relative to the SVG element
    const svgRect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - svgRect.left;
    const cursorY = e.clientY - svgRect.top;

    // Calculate the point in world space that the cursor is pointing at
    const worldX = (cursorX - transform.x) / transform.scale;
    const worldY = (cursorY - transform.y) / transform.scale;

    // Calculate new scale
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = transform.scale * scaleFactor;
    
    if (newScale > calculateInitialScale() * 0.01 && newScale < calculateInitialScale() * 700000) {
      // Calculate new position to keep the cursor point fixed
      const newX = cursorX - worldX * newScale;
      const newY = cursorY - worldY * newScale;

      setTransform(prev => ({
        x: newX,
        y: newY,
        scale: newScale
      }));
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate size based on zoom level
  const calculateSize = (baseSize) => {
    // Inverse logarithmic scaling - objects appear larger when zoomed out
    const inverseScaleFactor = Math.pow(transform.scale, 0.3); // Reduced from 0.5 to make size change less dramatic
    return Math.max(2, baseSize * inverseScaleFactor * 0.05);
  };

  const showMoons = transform.scale >= MOON_VISIBILITY_THRESHOLD;

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen overflow-hidden">
      <svg 
        width={dimensions.width}
        height={dimensions.height}
        className="bg-black"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Planet Orbits */}
        {data.map((planet) => {
          if (planet.name === "Sun") return null;
          const dx = planet.x;
          const dy = planet.y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          return (
            <circle
              key={`orbit-${planet.id}`}
              cx={transform.x}
              cy={transform.y}
              r={radius * transform.scale}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Moon Orbits */}
        {showMoons && data.map((planet) => 
          planet.moons?.map(moon => {
            const planetX = transform.x + (planet.x * transform.scale);
            const planetY = transform.y + (planet.y * transform.scale);
            return (
              <circle
                key={`orbit-${moon.id}`}
                cx={planetX}
                cy={planetY}
                r={moon.distance * transform.scale}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            );
          })
        )}

        {/* Planets and Moons */}
        {data.map((planet) => (
          <g key={planet.id}>
            {/* Planet */}
            <circle
              cx={transform.x + (planet.x * transform.scale)}
              cy={transform.y + (planet.y * transform.scale)}
              r={calculateSize(planet.radius)}
              fill={planet.color}
            />
            
            {/* Planet label */}
            <text
              x={transform.x + (planet.x * transform.scale)}
              y={transform.y + (planet.y * transform.scale) + calculateSize(planet.radius) + 10}
              fill="white"
              fontSize={12}
              textAnchor="middle"
              className="select-none"
            >
              {planet.name}
            </text>

            {/* Moons */}
            {showMoons && planet.moons?.map(moon => (
              <g key={moon.id}>
                <circle
                  cx={transform.x + ((planet.x + moon.x - planet.x) * transform.scale)}
                  cy={transform.y + ((planet.y + moon.y - planet.y) * transform.scale)}
                  r={calculateSize(moon.radius)}
                  fill={moon.color}
                />
                <text
                  x={transform.x + ((planet.x + moon.x - planet.x) * transform.scale)}
                  y={transform.y + ((planet.y + moon.y - planet.y) * transform.scale) + calculateSize(moon.radius) + 8}
                  fill="white"
                  fontSize={10}
                  textAnchor="middle"
                  className="select-none"
                >
                  {moon.name}
                </text>
              </g>
            ))}
          </g>
        ))}

        {clusterFleets().map((fleet, index) => (
          <g key={`fleet-${index}`}>
            <circle
              cx={transform.x + (fleet.Xcor * transform.scale)}
              cy={transform.y + (fleet.Ycor * transform.scale)}
              r={3}
              fill="white"
            />

            {fleet.fleetNames.map((name, i) => (
              <text
                key={`fleet-name-${index}-${i}`}
                x={transform.x + (fleet.Xcor * transform.scale)}
                y={transform.y + (fleet.Ycor * transform.scale) - 15 - (i * 12)} // Stack vertically with 12px spacing
                fill="white"
                fontSize={10}
                textAnchor="middle"
                className="select-none"
              >
                {name}
              </text>
            ))}

            {(fleet.Xcor != fleet.LastXcor || fleet.Ycor != fleet.LastYcor) && (
              <g>
                <line
                  x1={transform.x + (fleet.LastXcor * transform.scale)}
                  y1={transform.y + (fleet.LastYcor * transform.scale)}
                  x2={transform.x + (fleet.Xcor * transform.scale)}
                  y2={transform.y + (fleet.Ycor * transform.scale)}
                  stroke="white"
                  strokeWidth={1}
                  markerEnd="url(#arrowhead)"
                />
            </g>
            )}
          </g>
        ))}

        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="white" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export default SolarSystem;