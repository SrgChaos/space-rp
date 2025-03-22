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

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { token, logout } = useAuth();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [error, setError] = useState('');
  const [solarSystemData, setSolarSystemData] = useState<CelestialBody[]>([]);
  const [colonyData, setColonyData] = useState<Colony[]>([]);
  const router = useRouter();
  const resolvedParams = React.use(params);

  const gameDataLoaded = false;
  const solarSystemLoaded = false;
  const colonyDataLoaded = false;

  useEffect(() => {
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
        gameDataLoaded = true;
      } catch (error) {
        setError('Error loading game data');
        console.error('Error fetching game data:', error);
      }
    };

    const fetchSolarSystem = async () => {
      try {
        const systemID = 13355;
        const response = await fetch(`https://rpc.datenleiche.io:5000/api/solar-system/${systemID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if(!response.ok) {
          throw new Error('Network response was not ok');
        }
        const systemData = await response.json();
        setSolarSystemData(systemData);
        solarSystemLoaded = true;
      } catch (error) {
        setError('Error loading System Data');
        console.error('Error loading System Data', error);
      }
    }

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
        colonyDataLoaded = true;
      } catch(error) {
        setError('Error loading System Data');
        console.error('Error loading System Data', error);
      }
    }

    if (token) {
      fetchUserData();
      fetchGameData();
      fetchSolarSystem();
      fetchColonyData();
    }
  }, [token, resolvedParams.gameId, logout]);

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

  if (!gameData) {
    return <div>Loading...</div>;
  }

  if(gameDataLoaded && colonyDataLoaded && solarSystemLoaded){
    return (
      /*<div className="min-h-screen p-8 bg-gray-100">
        <Card>
          <CardHeader>
            <CardTitle>{gameData.RaceTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Game State: true</p>
              <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
              </div>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>*/
      <div className="relative">
        <SolarSystem data={solarSystemData}/>
        <GameUIOverlay colonies={colonyData}/>
      </div>
    );
  }
}