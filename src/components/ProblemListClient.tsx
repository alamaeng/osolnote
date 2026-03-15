'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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

type SortConfig = { key: keyof Problem; direction: 'ascending' | 'descending' }

export default function ProblemListClient({ initialProblems, initialBookmarkedIds, isLoggedIn }: ProblemListClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // State initialized from URL or defaults
    const [selectedDomain, setSelectedDomain] = useState<string>('all')
    const [selectedSource, setSelectedSource] = useState<string>('all')
    const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false)
    const [sortConfig, setSortConfig] = useState<SortConfig[]>([])

    // Convert array to Set for fast lookup
    const bookmarkedSet = useMemo(() => new Set(initialBookmarkedIds), [initialBookmarkedIds])

    // Extract unique domains and sources
    const domains = useMemo(() => {
        const unique = new Set(initialProblems.map(p => p.domain?.trim()).filter(Boolean) as string[])
        return Array.from(unique).sort()
    }, [initialProblems])

    const sources = useMemo(() => {
        const unique = new Set(initialProblems.map(p => p.source?.trim()).filter(Boolean) as string[])
        return Array.from(unique).sort()
    }, [initialProblems])

    // --- URL SYNC EFFECT ---
    useEffect(() => {
        const domainParam = searchParams.get('domain')
        if (domainParam && domainParam !== selectedDomain) {
            setSelectedDomain(domainParam)
        }

        const sourceParam = searchParams.get('source')
        if (sourceParam && sourceParam !== selectedSource) {
            setSelectedSource(sourceParam)
        }

        const bookmarkedParam = searchParams.get('bookmarked')
        const isBookmarkedOnly = bookmarkedParam === 'true'
        if (isBookmarkedOnly !== showBookmarkedOnly) {
            setShowBookmarkedOnly(isBookmarkedOnly)
        }

        const sortParam = searchParams.get('sort')
        if (sortParam) {
            try {
                const parsedSort = JSON.parse(sortParam) as SortConfig[]
                if (Array.isArray(parsedSort) && JSON.stringify(parsedSort) !== JSON.stringify(sortConfig)) {
                    setSortConfig(parsedSort)
                }
            } catch (e) {
                console.error("Failed to parse sort params", e)
            }
        }
        
        // This effect is only for initial load synchronization from URL strictly, 
        // to avoid cascading renders we disable exhaustive deps because we really only want 
        // this to run when searchParams changes at mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    // Helper to update URL when state changes
    const updateURL = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        for (const [key, value] of Object.entries(updates)) {
            if (value === null) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [searchParams, pathname, router])


    // Handlers that update both local state and URL
    const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setSelectedDomain(val)
        updateURL({ domain: val === 'all' ? null : val })
    }

    const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setSelectedSource(val)
        updateURL({ source: val === 'all' ? null : val })
    }

    const handleBookmarkedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked
        setShowBookmarkedOnly(checked)
        updateURL({ bookmarked: checked ? 'true' : null })
    }

    const handleSort = (key: keyof Problem, isShiftPressed: boolean) => {
        setSortConfig((prevConfig) => {
            const existingSortIndex = prevConfig.findIndex((s) => s.key === key);
            let nextDirection: 'ascending' | 'descending' | null = 'ascending';

            if (existingSortIndex >= 0) {
                if (prevConfig[existingSortIndex].direction === 'ascending') {
                    nextDirection = 'descending';
                } else {
                    nextDirection = null; // Remove sorting for this column
                }
            }

            let newConfig: SortConfig[] = []
            if (isShiftPressed) {
                newConfig = [...prevConfig];
                if (nextDirection) {
                    if (existingSortIndex >= 0) {
                        newConfig[existingSortIndex].direction = nextDirection;
                    } else {
                        newConfig.push({ key, direction: nextDirection });
                    }
                } else {
                    newConfig.splice(existingSortIndex, 1);
                }
            } else {
                if (nextDirection) {
                    newConfig = [{ key, direction: nextDirection }];
                } else {
                    newConfig = [];
                }
            }

            // Update URL
            updateURL({ sort: newConfig.length > 0 ? JSON.stringify(newConfig) : null })
            return newConfig;
        });
    };

    const getSortIndicator = (key: keyof Problem) => {
        const sortIndex = sortConfig.findIndex((s) => s.key === key);
        if (sortIndex === -1) return null;

        const config = sortConfig[sortIndex];
        const arrow = config.direction === 'ascending' ? '▲' : '▼';
        
        if (sortConfig.length > 1) {
            return `${arrow}(${sortIndex + 1})`;
        }
        return arrow;
    };


    // Filter and sort problems
    const filteredProblems = useMemo(() => {
        let result = [...initialProblems]

        if (showBookmarkedOnly) {
            result = result.filter(p => bookmarkedSet.has(p.id))
        }

        if (selectedDomain !== 'all') {
            result = result.filter(p => p.domain?.trim() === selectedDomain)
        }

        if (selectedSource !== 'all') {
            result = result.filter(p => p.source?.trim() === selectedSource)
        }

        result.sort((a, b) => {
             for (const config of sortConfig) {
                const valA = a[config.key];
                const valB = b[config.key];

                if (valA === valB) continue;

                if (valA === null || valA === undefined) return 1;
                if (valB === null || valB === undefined) return -1;

                if (valA < valB) return config.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return config.direction === 'ascending' ? 1 : -1;
            }
            return 0; // Default to natural order if no sort config or properties are equal
        })

        return result
    }, [initialProblems, selectedDomain, selectedSource, showBookmarkedOnly, sortConfig, bookmarkedSet])

    // Memoize the SortButton renderer to avoid the inline component lint error
    const renderSortButton = (sortKey: keyof Problem, label: string) => (
        <button
            onClick={(e) => handleSort(sortKey, e.shiftKey)}
            className={`px-3 py-1 text-sm rounded transition-colors whitespace-nowrap ${
                sortConfig.some(s => s.key === sortKey)
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 font-medium'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
            }`}
        >
            {label} {getSortIndicator(sortKey)}
        </button>
    )

    return (
        <div>
            {/* Filters & Sorting */}
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 space-y-4">
                <div className="flex flex-wrap gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">영역 (Domain)</label>
                        <select
                            value={selectedDomain}
                            onChange={handleDomainChange}
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
                            onChange={handleSourceChange}
                            className="w-40 p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                            aria-label="출처 선택"
                        >
                            <option value="all">전체</option>
                            {sources.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {isLoggedIn && (
                        <div className="flex items-center space-x-2 pb-2">
                           <label className="flex items-center space-x-2 cursor-pointer relative">
                                <input
                                    type="checkbox"
                                    checked={showBookmarkedOnly}
                                    onChange={handleBookmarkedToggle}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all"
                                    aria-label="복습함만 보기"
                                />
                                <span className="absolute left-1 top-1/2 -translate-y-1/2 flex h-3 w-3 items-center justify-center pt-[1px] opacity-0 peer-checked:opacity-100 transition-opacity">
                                    <svg viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white">
                                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">복습함만 보기 ⭐️</span>
                            </label>
                        </div>
                    )}
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        정렬 기준 (다중 정렬: Shift + Click)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {renderSortButton('subject', '과목')}
                        {renderSortButton('domain', '영역')}
                        {renderSortButton('title', '문제 제목')}
                        {renderSortButton('score', '배점')}
                        {renderSortButton('source', '출처')}
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
                                                    onToggle={(isBookmarked) => {
                                                        if (isBookmarked) {
                                                            bookmarkedSet.add(problem.id);
                                                        } else {
                                                            bookmarkedSet.delete(problem.id);
                                                        }
                                                    }}
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
                            href={`/problems/${problem.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
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
