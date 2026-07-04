import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/common/UserAvatar";
import { getRelativeTime } from "@/lib/utils";
import type { RecentActivity as RecentActivityType } from "@/types";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface RecentActivityProps {
  activities: RecentActivityType[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const { t } = useLanguage();

  return (
    <Card className="glass border-border/50 col-span-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider">{t('dashboard.charts.recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {activities.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4 max-h-[350px] overflow-y-auto scrollbar-thin pr-2">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <UserAvatar name={activity.userName} image={activity.userAvatar} size="sm" className="mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-foreground leading-normal">
                    <span className="font-semibold">{activity.userName}</span>{" "}
                    <span className="text-muted-foreground">{activity.action.toLowerCase()}</span>{" "}
                    <span className="font-medium text-primary hover:underline">
                      {activity.bugCode}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                    {activity.bugTitle}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                  {getRelativeTime(activity.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
