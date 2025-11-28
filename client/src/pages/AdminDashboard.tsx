import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings, Flame, LogOut, Plus, Trash2 } from "lucide-react";
import type { Category, Subcategory, Plan, Settings as SettingsType } from "@shared/schema";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [settings, setSettings] = useState<SettingsType>({ discordLink: "" });

  const [discordLink, setDiscordLink] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catsRes, subsRes, plansRes, setsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/subcategories"),
        fetch("/api/plans"),
        fetch("/api/settings"),
      ]);

      if (catsRes.ok) setCategories(await catsRes.json());
      if (subsRes.ok) setSubcategories(await subsRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
      if (setsRes.ok) {
        const s = await setsRes.json();
        setSettings(s);
        setDiscordLink(s.discordLink);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const updateSettings = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordLink }),
      });
      if (res.ok) {
        setSettings(await res.json());
        toast({ title: "Settings updated successfully" });
      }
    } catch (error) {
      toast({ title: "Error updating settings", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const confirmDelete = (type: string, id: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const endpoint = `/api/${deleteTarget.type}s/${deleteTarget.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Deleted successfully" });
        loadData();
      }
    } catch (error) {
      toast({ title: "Error deleting", variant: "destructive" });
    }
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Phoenix Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>Manage your Phoenix Cloud settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="discord" className="text-sm font-medium">
                    Discord Support Server Link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="discord"
                      placeholder="https://discord.gg/..."
                      value={discordLink}
                      onChange={(e) => setDiscordLink(e.target.value)}
                      data-testid="input-discord-link"
                    />
                    <Button onClick={updateSettings} data-testid="button-save-settings">
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This link is used for "Order Now" buttons and support channels.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Categories ({categories.length})</CardTitle>
                <CardDescription>Manage hosting categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`item-category-${cat.id}`}
                    >
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete("category", cat.id)}
                        data-testid={`button-delete-category-${cat.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full" size="sm" data-testid="button-add-category">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subcategories ({subcategories.length})</CardTitle>
                <CardDescription>Manage hosting subcategories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {subcategories.map((sub) => {
                    const cat = categories.find((c) => c.id === sub.categoryId);
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`item-subcategory-${sub.id}`}
                      >
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cat?.name} / /{sub.slug}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete("subcategory", sub.id)}
                          data-testid={`button-delete-subcategory-${sub.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full" size="sm" data-testid="button-add-subcategory">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subcategory
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plans ({plans.length})</CardTitle>
                <CardDescription>Manage hosting plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {plans.map((plan) => {
                    const cat = categories.find((c) => c.id === plan.categoryId);
                    const sub = subcategories.find((s) => s.id === plan.subcategoryId);
                    return (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`item-plan-${plan.id}`}
                      >
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cat?.name} → {sub?.name}
                          </p>
                          <p className="text-sm font-mono text-primary">{plan.price}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete("plan", plan.id)}
                          data-testid={`button-delete-plan-${plan.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full" size="sm" data-testid="button-add-plan">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Item?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item.
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
