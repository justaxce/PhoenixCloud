import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import type { AboutPageContent, TeamMember } from "@shared/schema";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
}

interface AboutProps {
  categories?: Category[];
}

export default function About({ categories = [] }: AboutProps) {
  const [aboutContent, setAboutContent] = useState<AboutPageContent | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, teamRes] = await Promise.all([
          fetch("/api/about"),
          fetch("/api/team-members"),
        ]);
        
        if (aboutRes.ok) {
          setAboutContent(await aboutRes.json());
        }
        if (teamRes.ok) {
          setTeamMembers(await teamRes.json());
        }
      } catch (err) {
        console.error("Failed to load about page data:", err);
      }
    };

    fetchData();
  }, []);

  if (!aboutContent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header categories={categories} />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        <section 
          className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/30"
          style={{
            backgroundImage: aboutContent.heroImageUrl ? `url(${aboutContent.heroImageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className={`absolute inset-0 ${aboutContent.heroImageUrl ? "bg-black/60" : ""}`} />
          <div className="relative z-10 container mx-auto px-4 py-20 text-center">
            <Badge variant="secondary" className="mb-4" data-testid="badge-about-us">
              {aboutContent.heroSubtitle}
            </Badge>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground dark:text-white"
              data-testid="text-hero-title"
            >
              {aboutContent.heroTitle}
            </h1>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-muted/50" />
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-primary/30 to-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-primary/20" />
                  </div>
                </div>
                <Card className="max-w-md">
                  <CardContent className="p-6 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl md:text-5xl font-bold text-primary" data-testid="text-years">
                        {aboutContent.yearsExperience}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Years<br />Experience<br />Hosting
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Badge variant="outline" data-testid="badge-company-name">
                  We are {aboutContent.companyName}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-story-title">
                  {aboutContent.storyTitle}
                </h2>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-story-content">
                  {aboutContent.storyContent}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              <Card className="p-6 md:p-8">
                <Badge variant="outline" className="mb-4">Company Information</Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-company-name">
                  {aboutContent.companyName}
                </h3>
                <p className="text-muted-foreground mb-4" data-testid="text-company-description">
                  {aboutContent.companyDescription}
                </p>
                {aboutContent.companyAddress && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Address:</strong> {aboutContent.companyAddress}
                  </p>
                )}
                {aboutContent.supportEmail && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                    <Mail className="h-4 w-4" />
                    <strong>Support Email:</strong>{" "}
                    <a href={`mailto:${aboutContent.supportEmail}`} className="text-primary hover:underline">
                      {aboutContent.supportEmail}
                    </a>
                  </p>
                )}
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold mb-4" data-testid="text-vision-title">
                  {aboutContent.visionTitle}
                </h3>
                <p className="text-muted-foreground" data-testid="text-vision-content">
                  {aboutContent.visionContent}
                </p>
              </Card>
              <Card className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold mb-4" data-testid="text-mission-title">
                  {aboutContent.missionTitle}
                </h3>
                <p className="text-muted-foreground" data-testid="text-mission-content">
                  {aboutContent.missionContent}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {teamMembers.length > 0 && (
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-12">
                <div>
                  <Badge variant="outline" className="mb-4" data-testid="badge-team">
                    {aboutContent.teamSectionSubtitle}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-team-title">
                    {aboutContent.teamSectionTitle}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="overflow-hidden" data-testid={`card-team-member-${member.id}`}>
                    <CardContent className="p-0">
                      <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-primary/5">
                        {member.imageUrl ? (
                          <img 
                            src={member.imageUrl} 
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Avatar className="h-32 w-32">
                              <AvatarFallback className="text-4xl">
                                {member.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <div className="p-4 text-center bg-card">
                        <h3 className="font-bold text-lg" data-testid={`text-member-name-${member.id}`}>
                          {member.name}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`text-member-role-${member.id}`}>
                          {member.role}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-20 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <span className="text-4xl md:text-5xl font-bold text-primary" data-testid="text-stat1-value">
                  {aboutContent.stat1Value}
                </span>
                <p className="text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wide" data-testid="text-stat1-label">
                  {aboutContent.stat1Label}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-4xl md:text-5xl font-bold text-primary" data-testid="text-stat2-value">
                  {aboutContent.stat2Value}
                </span>
                <p className="text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wide" data-testid="text-stat2-label">
                  {aboutContent.stat2Label}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-4xl md:text-5xl font-bold text-primary" data-testid="text-stat3-value">
                  {aboutContent.stat3Value}
                </span>
                <p className="text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wide" data-testid="text-stat3-label">
                  {aboutContent.stat3Label}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-4xl md:text-5xl font-bold text-primary" data-testid="text-stat4-value">
                  {aboutContent.stat4Value}
                </span>
                <p className="text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wide" data-testid="text-stat4-label">
                  {aboutContent.stat4Label}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
