import type { Notice } from "../types/app";

type NoticeBannerProps = {
  notice: Notice | null;
};

export function NoticeBanner({ notice }: NoticeBannerProps) {
  if (!notice) {
    return null;
  }

  return <div className={`notice ${notice.type}`}>{notice.message}</div>;
}
