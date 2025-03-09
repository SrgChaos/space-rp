'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UserData {
  email: string;
  gameIds: string[];
  createdAt: string;
}

export default function DashboardPage() {
  const { token, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://rpc.datenleiche.io:5000/api/protected', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        logout();
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token, logout]);

  if (!isAuthenticated) {
    router.push('/login');
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Email: {userData.email}</p>
            <p>Account created: {new Date(userData.createdAt).toLocaleDateString()}</p>
            <div>
              <h3 className="font-semibold mb-2">Your Games:</h3>
              {userData.gameIds && userData.gameIds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData.gameIds.map((gameId) => (
                    <Button
                      key={gameId}
                      onClick={() => router.push(`/game/${gameId}`)}
                      variant="outline"
                    >
                      Game {gameId}
                    </Button>
                  ))}
                </div>
              ) : (
                <p>No games found</p>
              )}
            </div>
            <Button onClick={logout} variant="destructive">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}