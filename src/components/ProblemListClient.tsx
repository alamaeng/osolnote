'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import MathRenderer from '@/components/MathRenderer'

import BookmarkButton from '@/components/BookmarkButton'

type Problem = {
    id: number
    subject: string | null
    domain: string | null
    title: string | null
    body: string
    source: string | null
    score: number | null
    difficulty: number | null
    created_at: string
}

interface ProblemListClientProps {
    initialProblems: Problem[]
    initialBookmarkedIds: number[]
    isLoggedIn: boolean
}

export default function ProblemListClient({ initialProblems, initialBookmarkedIds, isLoggedIn }: ProblemListClientProps) {
    const [selectedDomain, setSelectedDomain] = useState<string>('all')
    const [selectedSource, setSelectedSource] = useState<string>('all')
    const [scoreSort, setScoreSort] = useState<'desc' | 'asc'>('desc')

    // Convert array to Set for fast lookup (will be passed to button, but good for local logic if needed)
    // Note: BookmarkButton manages its own state, but we provide the initial state.
    const bookmarkedSet = new Set(initialBookmarkedIds)

    // Extract unique domains and sources
    const domains = useMemo(() => {
        const unique = new Set(initialProblems.map(p => p.domain?.trim()).filter(Boolean) as string[])
        return Array.from(unique).sort()
    }, [initialProblems])

    const sources = useMemo(() => {
        const unique = new Set(initialProblems.map(p => p.source?.trim()).filter(Boolean) as string[])
        return Array.from(unique).sort()
    }, [initialProblems])

    // Filter and sort problems
    const filteredProblems = useMemo(() => {
        let result = [...initialProblems]

        if (selectedDomain !== 'all') {
            result = result.filter(p => p.domain?.trim() === selectedDomain)
        }

        if (selectedSource !== 'all') {
            result = result.filter(p => p.source?.trim() === selectedSource)
        }

        result.sort((a, b) => {
            const scoreA = a.score || 0
            const scoreB = b.score || 0
            return scoreSort === 'asc' ? scoreA - scoreB : scoreB - scoreA
        })

        return result
    }, [initialProblems, selectedDomain, selectedSource, scoreSort])

    return (
        <div>
            {/* Filters */}
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">영역 (Domain)</label>
                        <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            className="w-40 p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                            aria-label="영역 선택"
                        >
                            <option value="all">전체</option>
                            {domains.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">출처 (Source)</label>
                        <select
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                            className="w-40 p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                            aria-label="출처 선택"
                        >
                            <option value="all">전체</option>
                            {sources.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">배점 정렬</label>
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                            <button
                                onClick={() => setScoreSort('asc')}
                                className={`px-3 py-1 text-sm rounded ${scoreSort === 'asc' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                낮은순
                            </button>
                            <button
                                onClick={() => setScoreSort('desc')}
                                className={`px-3 py-1 text-sm rounded ${scoreSort === 'desc' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                높은순
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Problem List */}
            <div className="grid gap-6">
                {filteredProblems.map((problem) => (
                    <div key={problem.id} className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md border dark:border-gray-700 hover:border-indigo-500 transition-colors relative">
                        <div className="flex flex-wrap justify-between items-start gap-y-2 mb-4">
                            <div className="w-full">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {problem.subject && (
                                        <span className="inline-block px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-full whitespace-nowrap">
                                            {problem.subject}
                                        </span>
                                    )}
                                    <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full whitespace-nowrap">
                                        {problem.domain || '기타'}
                                    </span>
                                    {problem.source && (
                                        <span className="inline-block px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full whitespace-nowrap">
                                            {problem.source}
                                        </span>
                                    )}
                                    {problem.difficulty && (
                                        <span className="inline-block px-3 py-1 text-sm font-semibold text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 rounded-full whitespace-nowrap" aria-label={`난이도 ${problem.difficulty}점`}>
                                            {'★'.repeat(problem.difficulty)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    {problem.title && (
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {problem.title}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 ml-auto">
                                        {isLoggedIn && (
                                            <div className="z-10 bg-white dark:bg-gray-900 rounded-lg">
                                                <BookmarkButton
                                                    problemId={problem.id}
                                                    initialIsBookmarked={bookmarkedSet.has(problem.id)}
                                                />
                                            </div>
                                        )}
                                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap">
                                            {problem.score}점
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-24 overflow-hidden mb-4 relative mask-linear-gradient">
                            <MathRenderer content={problem.body.substring(0, 150) + (problem.body.length > 150 ? '...' : '')} />
                            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
                        </div>

                        <Link
                            href={`/problems/${problem.id}`}
                            className="inline-block w-full text-center px-4 py-2 text-white bg-black rounded hover:bg-gray-800 transition"
                        >
                            문제 풀기
                        </Link>
                    </div>
                ))}

                {filteredProblems.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg border border-dashed dark:border-gray-700">
                        조건에 맞는 문제가 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}
