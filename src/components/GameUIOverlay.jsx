import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FloatingWindow = ({ 
  title, 
  onClose, 
  children,
  width = 500,  // Default width
  height = 'auto',  // Default height
  initialPosition = { 
    x: window.innerWidth / 2 - 250, 
    y: window.innerHeight / 2 - 150 
  }
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Card 
      className="absolute shadow-lg"
      style={{ 
        left: position.x,
        top: position.y,
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <CardHeader
        className="cursor-grab bg-gray-100 p-2"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};

const GameUIOverlay = ( {colonies}) => {
  const [activeWindows, setActiveWindows] = useState({
    planets: false,
    fleet: false,
    resources: false,
    colonies: false,
  });

  const [selectedColony, setSelectedColony] = useState(colonies.length > 0 ? colonies[0].PopulationID : null);
  const [activeTab, setActiveTab] = useState("resources");
  console.log(colonies);

  const toggleWindow = (window) => {
    setActiveWindows(prev => ({
      ...prev,
      [window]: !prev[window]
    }));
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Bottom Center Buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-auto">
        <Button 
          onClick={() => toggleWindow('colonies')}
          className="bg-amber-600 hover:bg-amber-700"
        >
          Colonies
        </Button>
      </div>

      {/* Floating Windows */}
      {activeWindows.planets && (
        <div className="pointer-events-auto">
          <FloatingWindow 
            title="Planet Information" 
            onClose={() => toggleWindow('planets')}
            width={400}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Earth</h3>
                <p>Distance from Sun: 0.92 AU</p>
                <p>Orbital Period: 322.08 days</p>
                <Button size="sm">View Details</Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Mars</h3>
                <p>Distance from Sun: 1.524 AU</p>
                <p>Orbital Period: 687 days</p>
                <Button size="sm">View Details</Button>
              </div>
            </div>
          </FloatingWindow>
        </div>
      )}

      {activeWindows.fleet && (
        <div className="pointer-events-auto">
          <FloatingWindow 
            title="Fleet Management" 
            onClose={() => toggleWindow('fleet')}
          >
            <div className="space-y-4">
              <Button className="w-full">Build New Ship</Button>
              <Button className="w-full">Manage Fleet</Button>
              <Button className="w-full">View Trade Routes</Button>
            </div>
          </FloatingWindow>
        </div>
      )}

      {activeWindows.resources && (
        <div className="pointer-events-auto">
          <FloatingWindow 
            title="Resource Overview" 
            onClose={() => toggleWindow('resources')}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Energy:</span>
                <span>1,234 MW</span>
              </div>
              <div className="flex justify-between">
                <span>Minerals:</span>
                <span>567 units</span>
              </div>
              <div className="flex justify-between">
                <span>Population:</span>
                <span>890M</span>
              </div>
              <Button className="w-full mt-4">Resource Management</Button>
            </div>
          </FloatingWindow>
        </div>
      )}
    {activeWindows.colonies && (
      <div className="pointer-events-auto">
        <FloatingWindow 
          title="Colony Management" 
          onClose={() => toggleWindow('colonies')}
          width={700}
        >
          <div className="flex w-full" style={{ maxHeight: "450px" }}>
            {/* Left side - Colony list */}
            <div className="w-1/3 border-r pr-3" style={{ maxWidth: "150px" }}>
              <h3 className="font-semibold mb-2">Colonies</h3>
              <div className="space-y-1 overflow-y-auto" style={{ maxHeight: "400px" }}>
                {colonies.map(colony => (
                  <div 
                    key={colony.PopulationID}
                    className={`p-2 cursor-pointer rounded ${selectedColony === colony.PopulationID ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedColony(colony.PopulationID)}
                  >
                    <div className="font-medium">{colony.PopName}</div>
                    <div className="text-sm text-gray-600">{colony.Population}m</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right side - Colony details */}
            <div className="flex-1 pl-3 overflow-hidden">
              {colonies.find(c => c.PopulationID === selectedColony) && (
                <div className="h-full flex flex-col">
                  <div className="mb-2">
                    <h2 className="font-bold text-lg">
                      {colonies.find(c => c.PopulationID === selectedColony).PopName}
                    </h2>
                    <div className="text-gray-600 mb-2">
                      Population: {colonies.find(c => c.PopulationID === selectedColony).Population}m
                    </div>
                  </div>
                  
                  {/* Tabs for colony details */}
                  <Tabs defaultValue="resources" value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid grid-cols-3 mb-2">
                      <TabsTrigger value="resources">Resources</TabsTrigger>
                      <TabsTrigger value="installations">Installations</TabsTrigger>
                    </TabsList>
                    
                    {/* Resources Tab Content */}
                    <TabsContent value="resources" className="overflow-y-auto pr-2" style={{ maxHeight: "320px" }}>
                      {(() => {
                        const colony = colonies.find(c => c.PopulationID === selectedColony);
                        console.log("Colony " + colony);

                        const resourcesData = colony.details.resources;
                        const mineralsData = colony.details.minerals;
                        const mines = colony.details.installations.find(inst => inst.name === "Mine")?.amount || 0;
                        const industry = colony.details.installations.find(inst => inst.name === "Conventional Industry")?.amount || 0;
                      
                        const materialsTable = mineralsData.map(mineral => {
                          const productionRate = ((mines * 10) + (industry * 1.5)) * mineral.accessibility;

                          const depletionYears = productionRate > 0 ? mineral.amount / productionRate : 0;

                          return {
                            id: mineral.materialId,
                            name: mineral.materialName,
                            stockpile: resourcesData[mineral.materialName.toLowerCase()] || 0,
                            amount: mineral.amount,
                            accessibility: mineral.accessibility,
                            productionRate: productionRate,
                            depletionYears: depletionYears
                          };
                        });

                        const getAccessibilityColor = (accessibility) => {
                          const value = parseFloat(accessibility) || 0;
                          if (value >= 0.9) return "bg-green-500";
                          if (value >= 0.7) return "bg-green-300";
                          if (value >= 0.4) return "bg-yellow-300";
                          return "bg-red-500";
                        };

                        const getDepletionColor = (years) => {
                          if (years === 0) return "text-gray-400";
                          if (years > 100) return "text-green-600";
                          if (years > 50) return "text-green-500";
                          if (years > 20) return "text-yellow-600";
                          if (years > 10) return "text-yellow-500";
                          return "text-red-500";
                        }

                        return (
                          <div className="w-full">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                  <th className="text-left py-2 px-1">Mineral</th>
                                  <th className="text-right py-2 px-1">Stockpile</th>
                                  <th className="text-right py-2 px-1">Deposit</th>
                                  <th className="text-center py-2 py-1">Access</th>
                                  <th className="text-right py-2 px-1">Production</th>
                                  <th className="text-right py-2 px-1">Depletion (yrs)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {materialsTable.map((material) => (
                                  <tr key={material.id} className="border-b hover:bg:gray-50">
                                    <td className="py-2 px-1">{material.name}</td>
                                    <td className="text-right py-2 px-1">
                                      {parseFloat(material.stockpile).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td className="text-right py-2 px-1">
                                      {parseFloat(material.amount).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td className="text-center py-2 px-1">
                                      <span
                                        className={`inline-block w-12 text-xs text-black rounded py-1 ${getAccessibilityColor(material.accessibility)}`}
                                      >
                                        {(parseFloat(material.accessibility) * 100).toFixed(0)}%
                                      </span>
                                    </td>
                                    <td className="text-right py-2 px-1">
                                      {material.productionRate.toLocaleString(undefined, {maximumFractionDigits: 1})}
                                    </td>
                                    <td className={`text-right py-2 px-1 ${getDepletionColor(material.depletionYears)}`}>
                                      {material.productionRate > 0 
                                        ? material.depletionYears.toLocaleString(undefined, {maximumFractionDigits: 0}) 
                                        : "∞"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </TabsContent>

                    <TabsContent value="installations" className="overflow-y-auto pr-2" style={{ maxHeight: "320px" }}>
                      {(() => {
                        const colonyData = colonies.find(c => c.PopulationID === selectedColony).details.installations;
                        if(colonyData && colonyData.length > 0){
                          return (
                            <div className="space-y-1 text-sm">
                              {colonyData.map((installation) => (
                                <div key={installation.id} className="flex justify-between border-b pb-1">
                                  <span className="">{installation.name}:</span>
                                  <span className="">{installation.amount}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                      })()}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </FloatingWindow>
      </div>
    )}
    </div>
  );
};

export default GameUIOverlay;