import React, { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react'
import { Box, Typography } from '@mui/material'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

function VirtualListComponent<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    )

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan)
    }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1)
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  if (items.length === 0) {
    return (
      <Box 
        sx={{ 
          height: containerHeight, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No items to display
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <Box
        sx={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        <Box
          sx={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <Box key={visibleRange.start + index} sx={{ height: itemHeight }}>
              {renderItem(item, visibleRange.start + index)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

const VirtualList = memo(VirtualListComponent) as typeof VirtualListComponent

// Hook for easy integration with existing lists
export const useVirtualList = <T,>(
  items: T[], 
  itemHeight: number = 60,
  containerHeight: number = 400
) => {
  const [isVirtualized, setIsVirtualized] = useState(false)

  useEffect(() => {
    // Enable virtualization for lists with more than 50 items
    setIsVirtualized(items.length > 50)
  }, [items.length])

  const VirtualizedList = useCallback(({ 
    renderItem, 
    className 
  }: { 
    renderItem: (item: T, index: number) => React.ReactNode
    className?: string 
  }) => {
    if (!isVirtualized) {
      return (
        <Box className={className}>
          {items.map((item, index) => (
            <Box key={index} sx={{ height: itemHeight }}>
              {renderItem(item, index)}
            </Box>
          ))}
        </Box>
      )
    }

    return (
      <VirtualList
        items={items}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        renderItem={renderItem}
        className={className}
      />
    )
  }, [items, itemHeight, containerHeight, isVirtualized])

  return {
    isVirtualized,
    VirtualizedList,
    itemCount: items.length
  }
} 