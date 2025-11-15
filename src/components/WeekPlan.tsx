import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface WeekData {
  week: number;
  tasks: string[];
}

interface WeekPlanProps {
  weeks: WeekData[];
}

const WeekPlan = ({ weeks }: WeekPlanProps) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent hidden md:block"></div>

      <div className="grid gap-6">
        {weeks.map((week, idx) => (
          <Card
            key={week.week}
            className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Week badge */}
                <div className="relative flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-xs text-primary-foreground/80 font-medium">Week</div>
                      <div className="text-xl font-bold text-primary-foreground">{week.week}</div>
                    </div>
                  </div>
                  {idx < weeks.length - 1 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 h-6 w-0.5 bg-gradient-to-b from-secondary to-transparent hidden md:block"></div>
                  )}
                </div>

                {/* Tasks */}
                <div className="flex-1 space-y-3 pt-2">
                  {week.tasks.map((task, taskIdx) => (
                    <div
                      key={taskIdx}
                      className="flex items-start gap-3 group/task hover:translate-x-1 transition-transform duration-200"
                    >
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5 group-hover/task:scale-110 transition-transform" />
                      <span className="text-foreground leading-relaxed">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeekPlan;
