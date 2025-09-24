import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#1C539B]/10">
            <Search className="size-8 text-[#1C539B]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#1C539B]">
            Page introuvable
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-6xl font-bold text-[#1C539B]/20">404</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              asChild
              className="flex-1 bg-[#1C539B] hover:bg-[#1C539B]/90 text-white"
            >
              <Link href="/">
                <Home className="size-4 mr-2" />
                Retour à l&apos;accueil
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-[#1C539B] text-[#1C539B] hover:bg-[#1C539B]/10"
            >
              <Link href="/chat">
                <Search className="size-4 mr-2" />
                Nouveau chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
