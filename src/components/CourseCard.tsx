import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, Star } from "lucide-react";

interface Course {
  title: string;
  price: number;
  salary_delta_est: number;
  duration?: string;
  provider?: string;
}

interface CourseCardProps {
  course: Course;
  type: "free" | "paid";
}

const CourseCard = ({ course, type }: CourseCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 hover:-translate-y-1">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="p-6 space-y-4 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            {course.provider && (
              <p className="text-sm text-muted-foreground mt-1">{course.provider}</p>
            )}
          </div>
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {type === "free" ? (
            <Badge className="bg-success text-success-foreground">
              Free
            </Badge>
          ) : (
            <Badge className="bg-primary text-primary-foreground">
              {formatCurrency(course.price)}
            </Badge>
          )}
          {course.duration && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {course.duration}
            </Badge>
          )}
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Expected Salary Uplift
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-accent">
              {formatCurrency(course.salary_delta_est)}
            </span>
            <span className="text-sm text-muted-foreground">/year</span>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            <span>
              {type === "free" ? "Infinite ROI" : `${Math.round(course.salary_delta_est / course.price)}x ROI`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
