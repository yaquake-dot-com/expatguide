"use client"

import {
  TelegramShareButton,
  WhatsappShareButton,
  FacebookShareButton,
  TelegramIcon,
  WhatsappIcon,
  FacebookIcon,
} from "react-share"

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Поделиться:</span>
      <TelegramShareButton url={url} title={title}>
        <TelegramIcon size={32} round />
      </TelegramShareButton>
      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <FacebookShareButton url={url} hashtag="#expatguide">
        <FacebookIcon size={32} round />
      </FacebookShareButton>
    </div>
  )
}
