import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  format,
  differenceInDays,
  startOfMonth,
  addMonths
} from "date-fns";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function PointsExpirationSchedule({ expiringPoints }) {
  const now = new Date();

  // Group points by month
  const monthlySchedule = React.useMemo(() => {
    const schedule = {};

    expiringPoints.transactions.forEach(tx => {
      if (!tx.expires_at) return;

      const expiryDate = new Date(tx.expires_at);
      const monthKey = format(startOfMonth(expiryDate), "MMMM yyyy");

      if (!schedule[monthKey]) {
        schedule[monthKey] = { points: 0, dates: [] };
      }

      schedule[monthKey].points += tx.points;

      const existingDate = schedule[monthKey].dates.find(
        d => d.date === tx.expires_at
      );

      if (existingDate) {
        existingDate.points += tx.points;
      } else {
        schedule[monthKey].dates.push({
          date: tx.expires_at,
          points: tx.points
        });
      }
    });

    // Sort dates inside each month
    Object.values(schedule).forEach(month => {
      month.dates.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    return schedule;
  }, [expiringPoints.transactions]);

  // Next 3 months
  const upcomingMonths = React.useMemo(() => {
    const months = [];

    for (let i = 0; i < 3; i++) {
      const month = addMonths(now, i);
      const key = format(startOfMonth(month), "MMMM yyyy");

      months.push({
        key,
        data: monthlySchedule[key] || { points: 0, dates: [] }
      });
    }

    return months;
  }, [monthlySchedule, now]);

  const getUrgencyColor = expiryDate => {
    const days = differenceInDays(new Date(expiryDate), now);
    if (days <= 1) return "text-destructive";
    if (days <= 7) return "text-amber-500";
    return "text-muted-foreground";
  };

  const getUrgencyBadge = expiryDate => {
    const days = differenceInDays(new Date(expiryDate), now);

    if (days <= 1)
      return { variant: "destructive", label: "Critical" };

    if (days <= 7)
      return { variant: "default", label: "Urgent" };

    return { variant: "secondary", label: "Upcoming" };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>Expiration Schedule</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {expiringPoints.total === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No points expiring soon
          </p>
        ) : (
          upcomingMonths.map(({ key, data }) => {
            if (data.points === 0) return null;

            return (
              <div key={key} className="space-y-3">
                {/* Month Header */}
                <div className="flex items-center justify-between pb-2 border-b">
                  <h4 className="font-semibold">{key}</h4>
                  <Badge variant="outline" className="bg-accent/10">
                    {data.points.toLocaleString()} points
                  </Badge>
                </div>

                {/* Expiration Dates */}
                <div className="space-y-2">
                  {data.dates.map((item, idx) => {
                    const daysUntil = differenceInDays(
                      new Date(item.date),
                      now
                    );
                    const urgency = getUrgencyBadge(item.date);

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          daysUntil <= 1 &&
                            "bg-destructive/10 border-destructive/20",
                          daysUntil > 1 &&
                            daysUntil <= 7 &&
                            "bg-amber-500/10 border-amber-500/20",
                          daysUntil > 7 && "bg-secondary/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {daysUntil <= 7 && (
                            <AlertTriangle
                              className={cn(
                                "h-4 w-4",
                                getUrgencyColor(item.date)
                              )}
                            />
                          )}

                          <div>
                            <p className="font-medium">
                              {format(
                                new Date(item.date),
                                "EEEE, MMMM d"
                              )}
                            </p>

                            <p
                              className={cn(
                                "text-sm flex items-center gap-1",
                                getUrgencyColor(item.date)
                              )}
                            >
                              <Clock className="h-3 w-3" />

                              {daysUntil === 0 &&
                                "Expires today"}

                              {daysUntil === 1 &&
                                "Expires tomorrow"}

                              {daysUntil > 1 &&
                                `Expires in ${daysUntil} days`}
                            </p>
                          </div>
                        </div>

                        {/* Points + Badge */}
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {item.points.toLocaleString()}
                          </p>

                          <Badge variant={urgency.variant} className="text-xs">
                            {urgency.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
