"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CarouselProps {
  children: React.ReactNode
  autoplay?: boolean
  className?: string
  slideSize?: string
}

export function Carousel({
  children,
  autoplay = false,
  className,
  slideSize = "basis-full sm:basis-1/2 lg:basis-1/3",
}: CarouselProps) {
  const plugins = autoplay
    ? [Autoplay({ delay: 5000, stopOnInteraction: true })]
    : []

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    plugins
  )

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className={cn("group relative", className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="-ml-4 flex pb-2">
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div key={i} className={cn("min-w-0 shrink-0 pl-4", slideSize)}>
                  {child}
                </div>
              ))
            : children}
        </div>
      </div>

      {/* Navigation buttons */}
      {canScrollPrev && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          onClick={() => emblaApi?.scrollPrev()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {canScrollNext && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          onClick={() => emblaApi?.scrollNext()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
