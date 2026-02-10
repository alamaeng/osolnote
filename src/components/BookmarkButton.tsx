'use client'

import { useState, useTransition } from 'react'
import { toggleBookmark } from '@/app/actions/bookmark'
import { Star } from 'lucide-react'

interface BookmarkButtonProps {
    problemId: number
    initialIsBookmarked: boolean
}

export default function BookmarkButton({ problemId, initialIsBookmarked }: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
    const [isPending, startTransition] = useTransition()

    const handleToggle = async () => {
        // Optimistic update
        const newState = !isBookmarked
        setIsBookmarked(newState)

        startTransition(async () => {
            const result = await toggleBookmark(problemId, isBookmarked)
            if (result.error) {
                // Revert on error
                setIsBookmarked(!newState)
                alert(result.error)
            }
        })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border transition-colors ${isBookmarked
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100'
                    : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
        >
            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-500' : ''}`} />
            <span className="text-xs font-semibold">{isBookmarked ? '복습함' : '복습하기'}</span>
        </button>
    )
}
