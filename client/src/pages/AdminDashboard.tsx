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
import { Settings, LogOut, Plus, Trash2, Edit2, Users } from "lucide-react";
import type { Category, Subcategory, Plan, Settings as SettingsType } from "@shared/schema";
import {
  AddCategoryDialog,
  AddSubcategoryDialog,
  AddPlanDialog,
} from "@/components/AdminDialogs";
import { AdminUserDialog } from "@/components/AdminUserDialog";
import { FAQDialog } from "@/components/FAQDialog";
import type { FAQ } from "@shared/schema";
import phoenixLogo from "@assets/phoenix-logo.png";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; username: string }>>([]);
  const [settings, setSettings] = useState<SettingsType>({ currency: "usd", supportLink: "", redirectLink: "" });

  const [supportLink, setSupportLink] = useState("");
  const [redirectLink, setRedirectLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [email, setEmail] = useState("");
  const [documentationLink, setDocumentationLink] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  const [heroTitleLine1, setHeroTitleLine1] = useState("");
  const [heroTitleLine2, setHeroTitleLine2] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [stat1Value, setStat1Value] = useState("");
  const [stat1Label, setStat1Label] = useState("");
  const [stat2Value, setStat2Value] = useState("");
  const [stat2Label, setStat2Label] = useState("");
  const [stat3Value, setStat3Value] = useState("");
  const [stat3Label, setStat3Label] = useState("");
  const [featuresSectionTitle, setFeaturesSectionTitle] = useState("");
  const [featuresSectionDescription, setFeaturesSectionDescription] = useState("");
  const [feature1Title, setFeature1Title] = useState("");
  const [feature1Description, setFeature1Description] = useState("");
  const [feature2Title, setFeature2Title] = useState("");
  const [feature2Description, setFeature2Description] = useState("");
  const [feature3Title, setFeature3Title] = useState("");
  const [feature3Description, setFeature3Description] = useState("");
  const [feature4Title, setFeature4Title] = useState("");
  const [feature4Description, setFeature4Description] = useState("");
  const [feature5Title, setFeature5Title] = useState("");
  const [feature5Description, setFeature5Description] = useState("");
  const [feature6Title, setFeature6Title] = useState("");
  const [feature6Description, setFeature6Description] = useState("");
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaDescription, setCtaDescription] = useState("");
  const [backgroundImageLight, setBackgroundImageLight] = useState("");
  const [backgroundImageDark, setBackgroundImageDark] = useState("");

  // Dialog states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: string; username: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showAddFAQ, setShowAddFAQ] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      const catsRes = await fetch("/api/categories");
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setCategories(Array.isArray(cats) ? cats : []);
      }

      // Load subcategories
      const subsRes = await fetch("/api/subcategories");
      if (subsRes.ok) {
        const subs = await subsRes.json();
        setSubcategories(Array.isArray(subs) ? subs : []);
      }

      // Load plans
      const plansRes = await fetch("/api/plans");
      if (plansRes.ok) {
        const plans = await plansRes.json();
        setPlans(Array.isArray(plans) ? plans : []);
      }

      // Load FAQs
      const faqsRes = await fetch("/api/faqs");
      if (faqsRes.ok) {
        const faqs = await faqsRes.json();
        setFAQs(Array.isArray(faqs) ? faqs : []);
      }

      // Load settings
      const setsRes = await fetch("/api/settings");
      if (setsRes.ok) {
        const s = await setsRes.json();
        setSettings(s);
        setSupportLink(s.supportLink || "");
        setRedirectLink(s.redirectLink || "");
        setInstagramLink(s.instagramLink || "");
        setYoutubeLink(s.youtubeLink || "");
        setEmail(s.email || "");
        setDocumentationLink(s.documentationLink || "");
        setHeroTitleLine1(s.heroTitleLine1 || "Cloud Hosting That");
        setHeroTitleLine2(s.heroTitleLine2 || "Rises Above");
        setHeroDescription(s.heroDescription || "");
        setStat1Value(s.stat1Value || "99.9%");
        setStat1Label(s.stat1Label || "Uptime SLA");
        setStat2Value(s.stat2Value || "50+");
        setStat2Label(s.stat2Label || "Global Locations");
        setStat3Value(s.stat3Value || "24/7");
        setStat3Label(s.stat3Label || "Expert Support");
        setFeaturesSectionTitle(s.featuresSectionTitle || "Why Choose Phoenix Cloud?");
        setFeaturesSectionDescription(s.featuresSectionDescription || "");
        setFeature1Title(s.feature1Title || "Blazing Fast");
        setFeature1Description(s.feature1Description || "");
        setFeature2Title(s.feature2Title || "DDoS Protection");
        setFeature2Description(s.feature2Description || "");
        setFeature3Title(s.feature3Title || "Global Network");
        setFeature3Description(s.feature3Description || "");
        setFeature4Title(s.feature4Title || "Instant Scaling");
        setFeature4Description(s.feature4Description || "");
        setFeature5Title(s.feature5Title || "24/7 Support");
        setFeature5Description(s.feature5Description || "");
        setFeature6Title(s.feature6Title || "99.9% Uptime");
        setFeature6Description(s.feature6Description || "");
        setCtaTitle(s.ctaTitle || "Ready to Rise Above?");
        setCtaDescription(s.ctaDescription || "");
        setBackgroundImageLight(s.backgroundImageLight || "");
        setBackgroundImageDark(s.backgroundImageDark || "");
      }

      // Load admin users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const users = await usersRes.json();
        setAdminUsers(Array.isArray(users) ? users : []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({ title: "Error loading data", variant: "destructive" });
    }
  };

  const updateSettings = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currency: "usd",
          supportLink, 
          redirectLink,
          instagramLink,
          youtubeLink,
          email,
          documentationLink,
          heroTitleLine1,
          heroTitleLine2,
          heroDescription,
          stat1Value,
          stat1Label,
          stat2Value,
          stat2Label,
          stat3Value,
          stat3Label,
          featuresSectionTitle,
          featuresSectionDescription,
          feature1Title,
          feature1Description,
          feature2Title,
          feature2Description,
          feature3Title,
          feature3Description,
          feature4Title,
          feature4Description,
          feature5Title,
          feature5Description,
          feature6Title,
          feature6Description,
          ctaTitle,
          ctaDescription,
          backgroundImageLight,
          backgroundImageDark
        }),
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
      let endpoint = "";
      if (deleteTarget.type === "admin-user") {
        endpoint = `/api/admin/users/${deleteTarget.id}`;
      } else {
        // Properly pluralize: category -> categories, subcategory -> subcategories, plan -> plans
        const pluralMap: Record<string, string> = {
          category: "categories",
          subcategory: "subcategories",
          plan: "plans",
        };
        const plural = pluralMap[deleteTarget.type] || `${deleteTarget.type}s`;
        endpoint = `/api/${plural}/${deleteTarget.id}`;
      }
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Deleted successfully" });
        loadData();
      } else {
        toast({ title: "Error deleting", variant: "destructive" });
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
            <img src={phoenixLogo} alt="Phoenix Cloud" className="h-9 w-9 object-contain" />
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
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
            <TabsTrigger value="admin">Admin Users</TabsTrigger>
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
                  <label htmlFor="supportLink" className="text-sm font-medium">
                    Support Server Link
                  </label>
                  <Input
                    id="supportLink"
                    placeholder="https://discord.gg/..."
                    value={supportLink}
                    onChange={(e) => setSupportLink(e.target.value)}
                    data-testid="input-support-link"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for support and help channels
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="redirectLink" className="text-sm font-medium">
                    Redirect Link (Order Now)
                  </label>
                  <Input
                    id="redirectLink"
                    placeholder="https://..."
                    value={redirectLink}
                    onChange={(e) => setRedirectLink(e.target.value)}
                    data-testid="input-redirect-link"
                  />
                  <p className="text-xs text-muted-foreground">
                    Where users are redirected when they click "Order Now" on plans
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="instagramLink" className="text-sm font-medium">
                    Instagram Link
                  </label>
                  <Input
                    id="instagramLink"
                    placeholder="https://instagram.com/..."
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    data-testid="input-instagram-link"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Instagram profile URL
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="youtubeLink" className="text-sm font-medium">
                    YouTube Link
                  </label>
                  <Input
                    id="youtubeLink"
                    placeholder="https://youtube.com/..."
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    data-testid="input-youtube-link"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your YouTube channel URL
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Contact Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@phoenixcloud.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your contact email address
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="documentationLink" className="text-sm font-medium">
                    Documentation Link
                  </label>
                  <Input
                    id="documentationLink"
                    placeholder="https://docs.phoenixcloud.com"
                    value={documentationLink}
                    onChange={(e) => setDocumentationLink(e.target.value)}
                    data-testid="input-documentation-link"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to your documentation or knowledge base
                  </p>
                </div>

                <Button onClick={updateSettings} data-testid="button-save-settings">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homepage" className="mt-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Edit the main hero section on the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title Line 1</label>
                    <Input
                      placeholder="Cloud Hosting That"
                      value={heroTitleLine1}
                      onChange={(e) => setHeroTitleLine1(e.target.value)}
                      data-testid="input-hero-title-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title Line 2</label>
                    <Input
                      placeholder="Rises Above"
                      value={heroTitleLine2}
                      onChange={(e) => setHeroTitleLine2(e.target.value)}
                      data-testid="input-hero-title-2"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Experience blazing-fast performance..."
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    data-testid="input-hero-description"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stats Cards</CardTitle>
                <CardDescription>Edit the 3 stats cards below the hero section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stat 1 Value</label>
                    <Input
                      placeholder="99.9%"
                      value={stat1Value}
                      onChange={(e) => setStat1Value(e.target.value)}
                      data-testid="input-stat1-value"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stat 1 Label</label>
                    <Input
                      placeholder="Uptime SLA"
                      value={stat1Label}
                      onChange={(e) => setStat1Label(e.target.value)}
                      data-testid="input-stat1-label"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stat 2 Value</label>
                    <Input
                      placeholder="50+"
                      value={stat2Value}
                      onChange={(e) => setStat2Value(e.target.value)}
                      data-testid="input-stat2-value"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stat 2 Label</label>
                    <Input
                      placeholder="Global Locations"
                      value={stat2Label}
                      onChange={(e) => setStat2Label(e.target.value)}
                      data-testid="input-stat2-label"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stat 3 Value</label>
                    <Input
                      placeholder="24/7"
                      value={stat3Value}
                      onChange={(e) => setStat3Value(e.target.value)}
                      data-testid="input-stat3-value"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stat 3 Label</label>
                    <Input
                      placeholder="Expert Support"
                      value={stat3Label}
                      onChange={(e) => setStat3Label(e.target.value)}
                      data-testid="input-stat3-label"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Section</CardTitle>
                <CardDescription>Edit the "Why Choose Phoenix Cloud?" section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title</label>
                    <Input
                      placeholder="Why Choose Phoenix Cloud?"
                      value={featuresSectionTitle}
                      onChange={(e) => setFeaturesSectionTitle(e.target.value)}
                      data-testid="input-features-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Description</label>
                    <Input
                      placeholder="Built for performance, reliability, and ease of use."
                      value={featuresSectionDescription}
                      onChange={(e) => setFeaturesSectionDescription(e.target.value)}
                      data-testid="input-features-description"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium mb-4">Feature Cards</p>
                  <div className="space-y-4">
                    {[
                      { title: feature1Title, setTitle: setFeature1Title, desc: feature1Description, setDesc: setFeature1Description, num: 1 },
                      { title: feature2Title, setTitle: setFeature2Title, desc: feature2Description, setDesc: setFeature2Description, num: 2 },
                      { title: feature3Title, setTitle: setFeature3Title, desc: feature3Description, setDesc: setFeature3Description, num: 3 },
                      { title: feature4Title, setTitle: setFeature4Title, desc: feature4Description, setDesc: setFeature4Description, num: 4 },
                      { title: feature5Title, setTitle: setFeature5Title, desc: feature5Description, setDesc: setFeature5Description, num: 5 },
                      { title: feature6Title, setTitle: setFeature6Title, desc: feature6Description, setDesc: setFeature6Description, num: 6 },
                    ].map((feature) => (
                      <div key={feature.num} className="grid grid-cols-2 gap-4 p-3 border rounded-lg">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Feature {feature.num} Title</label>
                          <Input
                            value={feature.title}
                            onChange={(e) => feature.setTitle(e.target.value)}
                            data-testid={`input-feature${feature.num}-title`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Feature {feature.num} Description</label>
                          <Input
                            value={feature.desc}
                            onChange={(e) => feature.setDesc(e.target.value)}
                            data-testid={`input-feature${feature.num}-desc`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CTA Section</CardTitle>
                <CardDescription>Edit the "Ready to Rise Above?" call-to-action section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CTA Title</label>
                  <Input
                    placeholder="Ready to Rise Above?"
                    value={ctaTitle}
                    onChange={(e) => setCtaTitle(e.target.value)}
                    data-testid="input-cta-title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CTA Description</label>
                  <Input
                    placeholder="Join thousands of satisfied customers..."
                    value={ctaDescription}
                    onChange={(e) => setCtaDescription(e.target.value)}
                    data-testid="input-cta-description"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Background Images</CardTitle>
                <CardDescription>Edit background images for light and dark themes. If image is broken or inaccessible, a default gradient will show.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Light Theme Background Image</label>
                  <Input
                    placeholder="https://i.pinimg.com/1200x/7f/b2/61/7fb2612d4b9630d91a70416fd7b8379c.jpg"
                    value={backgroundImageLight}
                    onChange={(e) => setBackgroundImageLight(e.target.value)}
                    data-testid="input-bg-light"
                  />
                  <p className="text-xs text-muted-foreground">Supports direct links and Discord media links</p>
                  {backgroundImageLight && (
                    <div className="mt-3 border rounded-lg overflow-hidden h-32 bg-muted">
                      <img
                        src={backgroundImageLight}
                        alt="Light theme preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dark Theme Background Image</label>
                  <Input
                    placeholder="https://media.discordapp.net/attachments/..."
                    value={backgroundImageDark}
                    onChange={(e) => setBackgroundImageDark(e.target.value)}
                    data-testid="input-bg-dark"
                  />
                  <p className="text-xs text-muted-foreground">Supports direct links and Discord media links</p>
                  {backgroundImageDark && (
                    <div className="mt-3 border rounded-lg overflow-hidden h-32 bg-muted">
                      <img
                        src={backgroundImageDark}
                        alt="Dark theme preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button onClick={updateSettings} className="w-full" data-testid="button-save-homepage">
              Save Homepage Content
            </Button>
          </TabsContent>

          <TabsContent value="admin" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Admin Users ({adminUsers.length})
                </CardTitle>
                <CardDescription>Manage admin accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {adminUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                      data-testid={`item-user-${user.id}`}
                    >
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditUser(true);
                          }}
                          data-testid={`button-edit-user-${user.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete("admin-user", user.id)}
                          data-testid={`button-delete-user-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => setShowCreateUser(true)}
                  data-testid="button-create-user"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Admin User
                </Button>
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
                      className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                      data-testid={`item-category-${cat.id}`}
                    >
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(cat);
                            setShowAddCategory(true);
                          }}
                          data-testid={`button-edit-category-${cat.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete("category", cat.id)}
                          data-testid={`button-delete-category-${cat.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => setShowAddCategory(true)}
                  data-testid="button-add-category"
                >
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
                        className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                        data-testid={`item-subcategory-${sub.id}`}
                      >
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cat?.name} / /{sub.slug}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSubcategory(sub);
                              setShowAddSubcategory(true);
                            }}
                            data-testid={`button-edit-subcategory-${sub.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete("subcategory", sub.id)}
                            data-testid={`button-delete-subcategory-${sub.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => setShowAddSubcategory(true)}
                  data-testid="button-add-subcategory"
                >
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
                        className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                        data-testid={`item-plan-${plan.id}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cat?.name} → {sub?.name}
                          </p>
                          <p className="text-sm font-mono text-primary">${plan.priceUsd}/{plan.period}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPlan(plan);
                              setShowAddPlan(true);
                            }}
                            data-testid={`button-edit-plan-${plan.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete("plan", plan.id)}
                            data-testid={`button-delete-plan-${plan.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => setShowAddPlan(true)}
                  data-testid="button-add-plan"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAQs ({faqs.length})</CardTitle>
                <CardDescription>Manage frequently asked questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                      data-testid={`item-faq-${faq.id}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{faq.question}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingFAQ(faq);
                            setShowAddFAQ(true);
                          }}
                          data-testid={`button-edit-faq-${faq.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete("faq", faq.id)}
                          data-testid={`button-delete-faq-${faq.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => setShowAddFAQ(true)}
                  data-testid="button-add-faq"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add FAQ
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AddCategoryDialog
        open={showAddCategory}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
          setShowAddCategory(open);
        }}
        onSuccess={loadData}
        editingCategory={editingCategory}
      />

      <AddSubcategoryDialog
        open={showAddSubcategory}
        onOpenChange={(open) => {
          if (!open) setEditingSubcategory(null);
          setShowAddSubcategory(open);
        }}
        categories={categories}
        onSuccess={loadData}
        editingSubcategory={editingSubcategory}
      />

      <AddPlanDialog
        open={showAddPlan}
        onOpenChange={(open) => {
          if (!open) setEditingPlan(null);
          setShowAddPlan(open);
        }}
        categories={categories}
        subcategories={subcategories}
        onSuccess={loadData}
        editingPlan={editingPlan}
      />

      <AdminUserDialog
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
        mode="create"
        onSuccess={loadData}
      />

      <AdminUserDialog
        open={showEditUser}
        onOpenChange={setShowEditUser}
        mode="edit"
        user={editingUser || undefined}
        onSuccess={loadData}
      />

      <FAQDialog
        open={showAddFAQ}
        onOpenChange={(open) => {
          if (!open) setEditingFAQ(null);
          setShowAddFAQ(open);
        }}
        onSuccess={loadData}
        editingFAQ={editingFAQ}
      />

      {/* Delete Confirmation */}
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
