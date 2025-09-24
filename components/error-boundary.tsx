"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1C539B]/10">
            <AlertTriangle className="h-8 w-8 text-[#1C539B]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#1C539B]">
            Oups ! Une erreur s'est produite
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Nous nous excusons pour ce désagrément. Notre équipe a été notifiée
            et travaille à résoudre le problème.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-1">
                  ID d'erreur: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={reset}
              className="flex-1 bg-[#1C539B] hover:bg-[#1C539B]/90 text-white"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1 border-[#1C539B] text-[#1C539B] hover:bg-[#1C539B]/10"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>

          <div className="text-center">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="text-[#1C539B] hover:text-[#1C539B]/80 hover:bg-[#1C539B]/5"
            >
              Actualiser la page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
