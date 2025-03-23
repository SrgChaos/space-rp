'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { useAuth } from '../../contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SolarSystem from '@/components/SolarSystem';
import GameUIOverlay from '@/components/GameUIOverlay';
import { useRouter } from 'next/navigation';

interface GameData {
  RaceTitle: string;
  RaceName: string;
}

interface Moon {
  id: number;
  name: string;
  distance: number;
  x: number;
  y: number;
  color: string;
  radius: number;
}

interface CelestialBody {
  id: number;
  name: string,
  x: number,
  y: number,
  color: string,
  radius: number,
  moons?: Moon[];
}

interface ColonyResourceData {
  Duranium: string;
  Neutronium: string;
  Corbomite: string;
  Tritanium: string;
  Boronide: string;
  Mercassium: string;
  Vendarite: string;
  Sorium: string;
  Uridium: string;
  Corundium: string;
  Gallicite: string;
}

interface Mineral {
  materialId: number;
  materialName: string;
  amount: number;
  accessibility: number;
}

interface ColonyMinerals {
  minerals: Mineral[];
}

interface ColonyInstallation {
  id: number;
  name: string;
  amount: number;
}

interface ColonyDetailsData {
  resources: ColonyResourceData;
  installations: ColonyInstallation[];
  minerals: ColonyMinerals;
}

interface Colony {
  id: number;
  name: string;
  population: string;
  details: ColonyDetailsData;
}

interface System {
  SystemID: number;
  Name: string;
}

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { token, logout } = useAuth();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [error, setError] = useState('');
  const [systems, setSystems] = useState<System[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<number | null>(null);
  const [solarSystemData, setSolarSystemData] = useState<CelestialBody[]>([]);
  const [colonyData, setColonyData] = useState<Colony[]>([]);
  const router = useRouter();
  const resolvedParams = React.use(params);

  const [gameDataLoaded, setGameDataLoaded] = useState(false);
  const [solarSystemLoaded, setSolarSystemLoaded] = useState(false);
  const [colonyDataLoaded, setColonyDataLoaded] = useState(false);
  const [systemsDataLoaded, setSystemsDataLoaded] = useState(false);

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const response = await fetch('https://rpc.datenleiche.io:5000/api/systems/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if(!response.ok) {
          throw new Error('Failed to fetch systems');
        }
        const data = await response.json();
        setSystems(data.systems);

        if(data.systems.length > 0) {
          setSelectedSystem(data.systems[0].SystemID);
          setSystemsDataLoaded(true);
        }
      } catch(error) {
        console.error('Error fetching systems:', error);
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await fetch('https://rpc.datenleiche.io:5000/api/protected', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        logout();
      }
    };


    const fetchGameData = async () => {
      try {
        const response = await fetch(`https://rpc.datenleiche.io:5000/api/games/${resolvedParams.gameId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch game data');
        }

        const data = await response.json();
        setGameData(data);
        console.log(gameData);
        setGameDataLoaded(true);
      } catch (error) {
        setError('Error loading game data');
        console.error('Error fetching game data:', error);
      }
    };

    const fetchColonyData = async () => {
      try {
        const response = await fetch(`https://rpc.datenleiche.io:5000/api/colonies/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if(!response.ok) {
          throw new Error('Network response was not ok');
        }

        const colonyData = await response.json();
        setColonyData(colonyData);
        setColonyDataLoaded(true);
      } catch(error) {
        setError('Error loading System Data');
        console.error('Error loading System Data', error);
      }
    }

    if (token) {
      fetchUserData();
      fetchSystems();
      fetchGameData();
      fetchColonyData();
    }
  }, [token, resolvedParams.gameId, logout]);

  useEffect(() => {
    const fetchSolarSystem = async () => {
      if (selectedSystem) {
        try {
          const response = await fetch(`https://rpc.datenleiche.io:5000/api/solar-system/${selectedSystem}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const systemData = await response.json();
          setSolarSystemData(systemData);
          setSolarSystemLoaded(true);
        } catch (error) {
          setError('Error loading System Data');
          console.error('Error loading System Data', error);
        }
      }
    };
  
    if (selectedSystem) {
      fetchSolarSystem();
    }
  }, [selectedSystem, token]);

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <Card>
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSystemChange = (systemId: number) => {
    setSelectedSystem(systemId);
  }

  if (!gameDataLoaded || !solarSystemLoaded || !colonyDataLoaded || !systemsDataLoaded) {
    console.log("Game Data Loaded: " + gameDataLoaded + " | System Loaded: " + solarSystemLoaded + " | Colony Loaded: " + colonyDataLoaded + " | Systems Data Loaded: " + systemsDataLoaded);
    return <div className="flex items-center justify-center h-screen">Loading game data...</div>;
  }

    return (
      <div className="relative">
        <SolarSystem data={solarSystemData}/>
        <GameUIOverlay colonies={colonyData} systems={systems} onSystemChange={handleSystemChange}/>
      </div>
    );
}