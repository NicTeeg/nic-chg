import { ChartVersion } from "../db/types";

export const getUniqueReleaseChannels = (versions: ChartVersion[]): string[] => {
  console.log("retrieving release channels");
  const channelPromotions = versions
    .flatMap((version) => version.promotions)
    .reduce(
      (acc, promotion) => {
        if (
          !acc[promotion.releaseChannel] ||
          new Date(promotion.promotedAt).getTime() <
            new Date(acc[promotion.releaseChannel]).getTime()
        ) {
          acc[promotion.releaseChannel] = promotion.promotedAt;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

  return Object.entries(channelPromotions)
    .sort(([, dateA], [, dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([channel]) => channel);
};
