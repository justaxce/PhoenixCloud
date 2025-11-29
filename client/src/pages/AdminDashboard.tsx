import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings, LogOut, Plus, Trash2, Edit2, Users } from "lucide-react";
import type { Category, Subcategory, Plan, Settings as SettingsType, AboutPageContent, TeamMember } from "@shared/schema";
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
  const [aboutContent, setAboutContent] = useState<AboutPageContent | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [showTeamMemberForm, setShowTeamMemberForm] = useState(false);
  const [teamMemberForm, setTeamMemberForm] = useState({ name: "", role: "", imageUrl: "", order: 0 });

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

  // Ctrl+S to save settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        updateSettings();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    supportLink, redirectLink, instagramLink, youtubeLink, email, documentationLink,
    heroTitleLine1, heroTitleLine2, heroDescription,
    stat1Value, stat1Label, stat2Value, stat2Label, stat3Value, stat3Label,
    featuresSectionTitle, featuresSectionDescription,
    feature1Title, feature1Description, feature2Title, feature2Description,
    feature3Title, feature3Description, feature4Title, feature4Description,
    feature5Title, feature5Description, feature6Title, feature6Description,
    ctaTitle, ctaDescription, backgroundImageLight, backgroundImageDark
  ]);

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
        setFeaturesSectionTitle(s.featuresSectionTitle || "Why Choose Pheonix Cloud?");
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
      
      // Load about page content
      try {
        const aboutRes = await fetch("/api/about", { signal: AbortSignal.timeout(8000) });
        if (aboutRes.ok) {
          const about = await aboutRes.json();
          setAboutContent(about);
        } else {
          // Set default if API fails
          setAboutContent({
            heroTitle: "This is our story",
            heroSubtitle: "About us",
            heroImageUrl: "",
            companyName: "Phoenix Cloud",
            companyDescription: "Web & Game Hosting",
            companyAddress: "",
            supportEmail: "",
            storyTitle: "The beginning",
            storyContent: "Company story",
            yearsExperience: "1",
            storyImage1Url: "",
            storyImage2Url: "",
            visionTitle: "Our Vision",
            visionContent: "Vision statement",
            missionTitle: "Our Mission",
            missionContent: "Mission statement",
            teamSectionTitle: "Behind the scene",
            teamSectionSubtitle: "Our solid team",
            stat1Value: "150",
            stat1Label: "Happy Clients",
            stat2Value: "300",
            stat2Label: "Servers Ordered",
            stat3Value: "10",
            stat3Label: "Awards Winning",
            stat4Value: "1",
            stat4Label: "Years Experience",
          });
        }
      } catch (error) {
        console.error("Error loading about content:", error);
        // Still set default values so UI doesn't break
        setAboutContent({
          heroTitle: "This is our story",
          heroSubtitle: "About us",
          heroImageUrl: "",
          companyName: "Phoenix Cloud",
          companyDescription: "Web & Game Hosting",
          companyAddress: "",
          supportEmail: "",
          storyTitle: "The beginning",
          storyContent: "Company story",
          yearsExperience: "1",
          storyImage1Url: "",
          storyImage2Url: "",
          visionTitle: "Our Vision",
          visionContent: "Vision statement",
          missionTitle: "Our Mission",
          missionContent: "Mission statement",
          teamSectionTitle: "Behind the scene",
          teamSectionSubtitle: "Our solid team",
          stat1Value: "150",
          stat1Label: "Happy Clients",
          stat2Value: "300",
          stat2Label: "Servers Ordered",
          stat3Value: "10",
          stat3Label: "Awards Winning",
          stat4Value: "1",
          stat4Label: "Years Experience",
        });
      }
      
      // Load team members
      try {
        const teamRes = await fetch("/api/team-members", { signal: AbortSignal.timeout(8000) });
        if (teamRes.ok) {
          const team = await teamRes.json();
          setTeamMembers(Array.isArray(team) ? team : []);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
        setTeamMembers([]);
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

  const updateAboutContent = async (updates: Partial<AboutPageContent>) => {
    try {
      const updatedContent = { ...aboutContent, ...updates };
      const res = await fetch("/api/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedContent),
      });
      if (res.ok) {
        setAboutContent(await res.json());
        toast({ title: "About page updated successfully" });
      } else {
        toast({ title: "Error updating about page", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error updating about page", variant: "destructive" });
    }
  };

  const handleSaveTeamMember = async () => {
    try {
      if (editingTeamMember) {
        const res = await fetch(`/api/team-members/${editingTeamMember.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamMemberForm),
        });
        if (res.ok) {
          toast({ title: "Team member updated successfully" });
          loadData();
        }
      } else {
        const res = await fetch("/api/team-members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamMemberForm),
        });
        if (res.ok) {
          toast({ title: "Team member added successfully" });
          loadData();
        }
      }
      setShowTeamMemberForm(false);
      setEditingTeamMember(null);
      setTeamMemberForm({ name: "", role: "", imageUrl: "", order: 0 });
    } catch (error) {
      toast({ title: "Error saving team member", variant: "destructive" });
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    try {
      const res = await fetch(`/api/team-members/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Team member deleted successfully" });
        loadData();
      }
    } catch (error) {
      toast({ title: "Error deleting team member", variant: "destructive" });
    }
  };

  const openEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    setTeamMemberForm({
      name: member.name,
      role: member.role,
      imageUrl: member.imageUrl || "",
      order: member.order || 0,
    });
    setShowTeamMemberForm(true);
  };

  const openAddTeamMember = () => {
    setEditingTeamMember(null);
    setTeamMemberForm({ name: "", role: "", imageUrl: "", order: teamMembers.length });
    setShowTeamMemberForm(true);
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
    <div className="min-h-screen">
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
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
            <TabsTrigger value="about" data-testid="tab-about-management">About Management</TabsTrigger>
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
                  <RichTextEditor
                    placeholder="Experience blazing-fast performance..."
                    value={heroDescription}
                    onChange={setHeroDescription}
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
                    <RichTextEditor
                      placeholder="Built for performance, reliability, and ease of use."
                      value={featuresSectionDescription}
                      onChange={setFeaturesSectionDescription}
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
                          <RichTextEditor
                            value={feature.desc}
                            onChange={feature.setDesc}
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
                  <RichTextEditor
                    placeholder="Join thousands of satisfied customers..."
                    value={ctaDescription}
                    onChange={setCtaDescription}
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

          <TabsContent value="about" className="mt-8 space-y-6">
            {aboutContent && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Hero Section</CardTitle>
                    <CardDescription>Edit the About page hero section</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hero Title</label>
                        <Input
                          placeholder="This is our story"
                          value={aboutContent.heroTitle}
                          onChange={(e) => setAboutContent({ ...aboutContent, heroTitle: e.target.value })}
                          data-testid="input-about-hero-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hero Subtitle</label>
                        <Input
                          placeholder="About us"
                          value={aboutContent.heroSubtitle}
                          onChange={(e) => setAboutContent({ ...aboutContent, heroSubtitle: e.target.value })}
                          data-testid="input-about-hero-subtitle"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hero Background Image URL</label>
                      <Input
                        placeholder="https://example.com/hero-image.jpg"
                        value={aboutContent.heroImageUrl || ""}
                        onChange={(e) => setAboutContent({ ...aboutContent, heroImageUrl: e.target.value })}
                        data-testid="input-about-hero-image"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Edit company details displayed on the About page</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Company Name</label>
                        <Input
                          placeholder="Phoenix Cloud"
                          value={aboutContent.companyName}
                          onChange={(e) => setAboutContent({ ...aboutContent, companyName: e.target.value })}
                          data-testid="input-about-company-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Support Email</label>
                        <Input
                          placeholder="support@phoenixcloud.com"
                          value={aboutContent.supportEmail || ""}
                          onChange={(e) => setAboutContent({ ...aboutContent, supportEmail: e.target.value })}
                          data-testid="input-about-email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Description</label>
                      <Input
                        placeholder="Web & Game Hosting Business..."
                        value={aboutContent.companyDescription}
                        onChange={(e) => setAboutContent({ ...aboutContent, companyDescription: e.target.value })}
                        data-testid="input-about-company-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Address</label>
                      <Input
                        placeholder="123 Cloud Street, Server City"
                        value={aboutContent.companyAddress || ""}
                        onChange={(e) => setAboutContent({ ...aboutContent, companyAddress: e.target.value })}
                        data-testid="input-about-address"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Story Section</CardTitle>
                    <CardDescription>Edit the company story section and images</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Story Title</label>
                        <Input
                          placeholder="The beginning"
                          value={aboutContent.storyTitle}
                          onChange={(e) => setAboutContent({ ...aboutContent, storyTitle: e.target.value })}
                          data-testid="input-about-story-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Years Experience</label>
                        <Input
                          placeholder="1"
                          value={aboutContent.yearsExperience}
                          onChange={(e) => setAboutContent({ ...aboutContent, yearsExperience: e.target.value })}
                          data-testid="input-about-years"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Story Content</label>
                      <RichTextEditor
                        placeholder="Phoenix Cloud started with a simple goal..."
                        value={aboutContent.storyContent}
                        onChange={(value) => setAboutContent({ ...aboutContent, storyContent: value })}
                        data-testid="input-about-story-content"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Story Image 1 URL</label>
                        <Input
                          placeholder="https://example.com/image1.jpg"
                          value={aboutContent.storyImage1Url || ""}
                          onChange={(e) => setAboutContent({ ...aboutContent, storyImage1Url: e.target.value })}
                          data-testid="input-about-story-image-1"
                        />
                        {aboutContent.storyImage1Url && (
                          <div className="mt-2 border rounded-lg overflow-hidden h-20 bg-muted">
                            <img
                              src={aboutContent.storyImage1Url}
                              alt="Story image 1 preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Story Image 2 URL</label>
                        <Input
                          placeholder="https://example.com/image2.jpg"
                          value={aboutContent.storyImage2Url || ""}
                          onChange={(e) => setAboutContent({ ...aboutContent, storyImage2Url: e.target.value })}
                          data-testid="input-about-story-image-2"
                        />
                        {aboutContent.storyImage2Url && (
                          <div className="mt-2 border rounded-lg overflow-hidden h-20 bg-muted">
                            <img
                              src={aboutContent.storyImage2Url}
                              alt="Story image 2 preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Vision & Mission</CardTitle>
                    <CardDescription>Edit your company vision and mission statements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Vision Title</label>
                        <Input
                          placeholder="Our Vision"
                          value={aboutContent.visionTitle}
                          onChange={(e) => setAboutContent({ ...aboutContent, visionTitle: e.target.value })}
                          data-testid="input-about-vision-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mission Title</label>
                        <Input
                          placeholder="Our Mission"
                          value={aboutContent.missionTitle}
                          onChange={(e) => setAboutContent({ ...aboutContent, missionTitle: e.target.value })}
                          data-testid="input-about-mission-title"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vision Content</label>
                      <RichTextEditor
                        placeholder="Our vision is to provide the most reliable..."
                        value={aboutContent.visionContent}
                        onChange={(value) => setAboutContent({ ...aboutContent, visionContent: value })}
                        data-testid="input-about-vision-content"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mission Content</label>
                      <RichTextEditor
                        placeholder="Our mission is to deliver the best..."
                        value={aboutContent.missionContent}
                        onChange={(value) => setAboutContent({ ...aboutContent, missionContent: value })}
                        data-testid="input-about-mission-content"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Section</CardTitle>
                    <CardDescription>Edit the team section header</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Team Section Title</label>
                        <Input
                          placeholder="Behind the scene"
                          value={aboutContent.teamSectionTitle}
                          onChange={(e) => setAboutContent({ ...aboutContent, teamSectionTitle: e.target.value })}
                          data-testid="input-about-team-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Team Section Subtitle</label>
                        <Input
                          placeholder="Our solid team"
                          value={aboutContent.teamSectionSubtitle}
                          onChange={(e) => setAboutContent({ ...aboutContent, teamSectionSubtitle: e.target.value })}
                          data-testid="input-about-team-subtitle"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                    <CardDescription>Edit the statistics displayed at the bottom of the About page</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stat 1 Value</label>
                        <Input
                          placeholder="150"
                          value={aboutContent.stat1Value}
                          onChange={(e) => setAboutContent({ ...aboutContent, stat1Value: e.target.value })}
                          data-testid="input-about-stat1-value"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stat 1 Label</label>
                        <Input
                          placeholder="Happy Clients"
                          value={aboutContent.stat1Label}
                          onChange={(e) => setAboutContent({ ...aboutContent, stat1Label: e.target.value })}
                          data-testid="input-about-stat1-label"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stat 2 Value</label>
                        <Input
                          placeholder="300"
                          value={aboutContent.stat2Value}
                          onChange={(e) => setAboutContent({ ...aboutContent, stat2Value: e.target.value })}
                          data-testid="input-about-stat2-value"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stat 2 Label</label>
                        <Input
                          placeholder="Servers Ordered"
                          value={aboutContent.stat2Label}
                          onChange={(e) => setAboutContent({ ...aboutContent, stat2Label: e.target.value })}
                          data-testid="input-about-stat2-label"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stat 3 Value</label>
                        <Input
                          placeholder="10"
                          value={aboutContent.stat3Value}
                          onChange={(e) => setAboutContent({ ...aboutContent, stat3Value: e.target.value })}
                          data-testid="input-about-stat3-value"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stat 3 Label</label>
                        <Input
                          placeholder="Awards Winning"
                          value={aboutContent.stat3Label}
                          onChange={(e) => setAboutContent({ ...aboutContent, stat3Label: e.target.value })}
                          data-testid="input-about-stat3-label"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stat 4 Value</label>
                        <Input
                          placeholder="1"
                          value={aboutContent.stat4Value}
                          onChange={(e) => setAboutContent({ ...aboutContent, stat4Value: e.target.value })}
                          data-testid="input-about-stat4-value"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stat 4 Label</label>
                        <Input
                          placeholder="Years Experience"
                          value={aboutContent.stat4Label}
                          onChange={(e) => setAboutContent({ ...aboutContent, stat4Label: e.target.value })}
                          data-testid="input-about-stat4-label"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={() => updateAboutContent(aboutContent)} className="w-full" data-testid="button-save-about">
                  Save About Page Content
                </Button>
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members ({teamMembers.length})
                </CardTitle>
                <CardDescription>Manage team members displayed on the About page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                      data-testid={`item-team-member-${member.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-bold text-primary">{member.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditTeamMember(member)}
                          data-testid={`button-edit-team-member-${member.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTeamMember(member.id)}
                          data-testid={`button-delete-team-member-${member.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={openAddTeamMember} className="w-full" data-testid="button-add-team-member">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Team Member
                </Button>
              </CardContent>
            </Card>

            {showTeamMemberForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingTeamMember ? "Edit Team Member" : "Add Team Member"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="John Doe"
                      value={teamMemberForm.name}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                      data-testid="input-team-member-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Input
                      placeholder="CEO & Founder"
                      value={teamMemberForm.role}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, role: e.target.value })}
                      data-testid="input-team-member-role"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      placeholder="https://example.com/avatar.jpg"
                      value={teamMemberForm.imageUrl}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, imageUrl: e.target.value })}
                      data-testid="input-team-member-image"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Order</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={teamMemberForm.order}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, order: parseInt(e.target.value) || 0 })}
                      data-testid="input-team-member-order"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveTeamMember} data-testid="button-save-team-member">
                      {editingTeamMember ? "Update" : "Add"} Team Member
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowTeamMemberForm(false);
                      setEditingTeamMember(null);
                      setTeamMemberForm({ name: "", role: "", imageUrl: "", order: 0 });
                    }} data-testid="button-cancel-team-member">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
