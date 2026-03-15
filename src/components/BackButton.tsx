'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
    const router = useRouter()

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center mb-6 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
            <span className="mr-2">←</span> 문제 목록으로 돌아가기
        </button>
    )
}
