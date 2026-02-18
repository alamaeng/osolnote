import { supabase } from '@/lib/supabase'
import MathRenderer from '@/components/MathRenderer'
import ProblemSolver from '@/components/ProblemSolver'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ProblemDetailPage({ params }: PageProps) {
    const { id } = await params

    const { data: problem, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !problem) {
        return <div className="p-8 text-center">문제를 찾을 수 없습니다.</div>
    }

    return (
        <div className="max-w-4xl mx-auto p-8 min-h-screen">
            <Link href="/problems" className="inline-block mb-6 text-gray-500 hover:text-black dark:hover:text-white">
                ← 문제 목록으로 돌아가기
            </Link>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap gap-2">
                            {problem.subject && (
                                <span className="inline-block px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-full">
                                    {problem.subject}
                                </span>
                            )}
                            <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                                {problem.domain || '기타'}
                            </span>
                            {problem.difficulty && (
                                <span className="inline-block px-3 py-1 text-sm font-semibold text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 rounded-full" aria-label={`난이도 ${problem.difficulty}점`}>
                                    {'★'.repeat(problem.difficulty)}
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-black dark:text-white">{problem.score}점</p>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-black dark:text-white mt-2">
                            {problem.title || `문제 ${problem.id}`}
                        </h1>
                        {problem.source && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {problem.source}
                            </p>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="mb-8">
                        <MathRenderer content={problem.body} />
                    </div>

                    {problem.image1 && (
                        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={problem.image1} alt="Problem" className="max-h-[500px] w-1/4 max-w-[25%] rounded shadow-sm mx-auto" />
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-dashed border-gray-300 dark:border-gray-700">
                        <ProblemSolver problemId={problem.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
