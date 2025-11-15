import { Card } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Course {
  title: string;
  price: number;
  salary_delta_est: number;
}

interface ROIChartProps {
  courses: Course[];
}

const ROIChart = ({ courses }: ROIChartProps) => {
  const chartData = courses.map((course) => ({
    x: course.price,
    y: course.salary_delta_est,
    name: course.title,
    isFree: course.price === 0,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border-2 border-primary/20 p-4 rounded-lg shadow-xl">
          <p className="font-semibold text-foreground mb-2">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Cost: {data.x === 0 ? "Free" : `$${data.x}`}
          </p>
          <p className="text-sm text-accent font-medium">
            Expected Uplift: ${data.y.toLocaleString()}/year
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 shadow-lg border-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-semibold">Cost vs. Salary Impact</h3>
            <p className="text-sm text-muted-foreground">Compare course investments and expected returns</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success"></div>
              <span className="text-sm text-muted-foreground">Free Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span className="text-sm text-muted-foreground">Paid Courses</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="x"
                name="Cost"
                label={{ value: "Course Cost ($)", position: "bottom", offset: 40 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Salary Impact"
                label={{ value: "Expected Salary Uplift ($)", angle: -90, position: "left", offset: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={chartData} fill="hsl(var(--primary))">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isFree ? "hsl(var(--success))" : "hsl(var(--primary))"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default ROIChart;
