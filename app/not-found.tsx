'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Under Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">The page you are looking for is currently under maintenance.</p>
          <Button onClick={() => router.back()}>
            Back to Previous Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}