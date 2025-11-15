import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, BookOpen, Calendar, Download, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CourseCard from "@/components/CourseCard";
import WeekPlan from "@/components/WeekPlan";
import ROIChart from "@/components/ROIChart";

interface Course {
  title: string;
  price: number;
  salary_delta_est: number;
  duration?: string;
  provider?: string;
}

interface WeekData {
  week: number;
  tasks: string[];
}

interface PlanData {
  best_free: Course[];
  best_paid: Course[];
  plan_weeks: WeekData[];
}

const Index = () => {
  const [skill, setSkill] = useState("");
  const [hours, setHours] = useState([10]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PlanData | null>(null);

  const handleGeneratePlan = async () => {
    if (!skill.trim()) {
      toast({
        title: "Skill Required",
        description: "Please enter a skill to generate your learning plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-learning-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            skill: skill.trim(),
            hours_per_week: hours[0],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast({
            title: "Rate Limit Reached",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (response.status === 402) {
          toast({
            title: "Credits Depleted",
            description: "AI credits have been used up. Please add more credits to continue.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate learning plan');
      }

      const planData = await response.json();
      setData(planData);
      
      toast({
        title: "Plan Generated! 🎉",
        description: "Your personalized learning path is ready.",
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate learning plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learning-plan-${skill.toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported Successfully",
      description: "Your learning plan has been downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning Optimization</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Learning ROI Optimizer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the most effective learning path for your career goals. Get personalized course recommendations with projected salary impact.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto p-8 shadow-lg border-2 hover:shadow-xl transition-all duration-300">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                Target Skill or Career Path
              </label>
              <Input
                placeholder="e.g., Data Analyst, Full Stack Developer, UX Designer..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="text-lg h-12 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Calendar className="h-4 w-4 text-secondary" />
                  Weekly Study Hours
                </label>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {hours[0]} hours/week
                </Badge>
              </div>
              <Slider
                value={hours}
                onValueChange={setHours}
                min={5}
                max={40}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 hrs/week</span>
                <span>40 hrs/week</span>
              </div>
            </div>

            <Button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-md hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Best Options...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Generate My Learning Plan
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {data && (
          <div className="mt-12 space-y-12 animate-fade-in">
            {/* Free Courses */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <div className="h-10 w-1 bg-gradient-to-b from-success to-success/50 rounded-full"></div>
                  Best Free Courses
                </h2>
                <Badge className="bg-success text-success-foreground px-4 py-2">
                  No Cost • High ROI
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.best_free.map((course, idx) => (
                  <CourseCard key={idx} course={course} type="free" />
                ))}
              </div>
            </div>

            {/* Paid Courses */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <div className="h-10 w-1 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                  Best Paid Courses
                </h2>
                <Badge className="bg-primary text-primary-foreground px-4 py-2">
                  Premium • Maximum ROI
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.best_paid.map((course, idx) => (
                  <CourseCard key={idx} course={course} type="paid" />
                ))}
              </div>
            </div>

            {/* ROI Chart */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <div className="h-10 w-1 bg-gradient-to-b from-accent to-accent/50 rounded-full"></div>
                ROI Analysis
              </h2>
              <ROIChart courses={[...data.best_free, ...data.best_paid]} />
            </div>

            {/* 8-Week Plan */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <div className="h-10 w-1 bg-gradient-to-b from-secondary to-primary rounded-full"></div>
                  Your 8-Week Learning Path
                </h2>
                <Button onClick={handleExport} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Plan
                </Button>
              </div>
              <WeekPlan weeks={data.plan_weeks} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
