"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, ShieldCheck, Settings, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProfileTab } from "./components/profile-tab";
import { SecurityTab } from "./components/security-tab";
import { PreferencesTab } from "./components/preferences-tab";

export default function AccountPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Minha Conta
                </h1>
                <Badge variant="secondary" className="text-muted-foreground">
                  Pessoal
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie suas informações pessoais, segurança e preferências.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="profile" className="w-full space-y-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
            <TabsList className="inline-flex w-auto min-w-full sm:w-auto bg-muted/50 p-1">
              <TabsTrigger value="profile" className="text-xs sm:text-sm px-4">
                <User className="w-4 h-4 mr-2 hidden sm:inline-block" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs sm:text-sm px-4">
                <ShieldCheck className="w-4 h-4 mr-2 hidden sm:inline-block" />
                Segurança
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="text-xs sm:text-sm px-4"
              >
                <Settings className="w-4 h-4 mr-2 hidden sm:inline-block" />
                Preferências
                <Sparkles className="w-3 h-3 ml-2 text-indigo-500" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="outline-none mt-0">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="security" className="outline-none mt-0">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="preferences" className="outline-none mt-0">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
