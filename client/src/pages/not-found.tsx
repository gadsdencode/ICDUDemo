import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col bg-background">
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </div>
      <SiteFooter compact />
    </div>
  );
}
