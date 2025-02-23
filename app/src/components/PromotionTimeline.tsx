import React from "react";
import { Chart, ChartVersion } from "../db/types";
import { Timeline, Typography } from "@material-tailwind/react";
import ChartVersionCard from "./ChartVersionCard";

interface PromotionTimelineProps {
  chart: Chart;
  versions: ChartVersion[];
}

interface GroupedPromotion {
  version: ChartVersion;
  promotedAt: string;
}

const PromotionTimeline: React.FC<PromotionTimelineProps> = ({ chart, versions }) => {
  // Get unique channels and their earliest promotion dates
  const channelFirstDates = versions
    .flatMap((version) =>
      version.promotions.map((p) => ({
        channel: p.releaseChannel,
        date: new Date(p.promotedAt).getTime(),
      })),
    )
    .reduce(
      (acc, { channel, date }) => {
        if (!acc[channel] || date < acc[channel]) {
          acc[channel] = date;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

  // Sort channels by their earliest promotion date
  const releaseChannels = Object.keys(channelFirstDates).sort(
    (a, b) => channelFirstDates[a] - channelFirstDates[b],
  );

  const groupedPromotions = releaseChannels.reduce(
    (acc, channel) => {
      const promotions: GroupedPromotion[] = [];
      versions.forEach((version) => {
        version.promotions
          .filter((p) => p.releaseChannel === channel)
          .forEach((promotion) => {
            promotions.push({
              version: version,
              promotedAt: promotion.promotedAt,
            });
          });
      });

      acc[channel] = promotions.sort(
        (a, b) => new Date(b.promotedAt).getTime() - new Date(a.promotedAt).getTime(),
      );
      return acc;
    },
    {} as Record<string, GroupedPromotion[]>,
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {releaseChannels.map((channel) => (
        <div key={channel} className="flex flex-col gap-2">
          <h3 className="font-semibold capitalize">{channel}</h3>
          <Timeline color="secondary" orientation="vertical">
            {groupedPromotions[channel]?.map((promotion) => (
              <Timeline.Item>
                <Timeline.Header>
                  <Timeline.Separator />
                  <Timeline.Icon className="h-3 w-3" />
                </Timeline.Header>
                <Timeline.Body className="-translate-y-1.5">
                  <Typography color="default" className="font-bold">
                    {new Date(promotion.promotedAt).toLocaleString()}
                  </Typography>
                  <Typography type="small" className="mt-2 text-foreground">
                    <ChartVersionCard
                      chart={chart}
                      version={promotion.version}
                      compact={true}
                      hideReleaseChannels={true}
                    />
                  </Typography>
                </Timeline.Body>
              </Timeline.Item>
            ))}
          </Timeline>
          {(!groupedPromotions[channel] || groupedPromotions[channel].length === 0) && (
            <div className="text-sm text-gray-500">No promotions</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PromotionTimeline;
