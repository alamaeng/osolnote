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
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-2">
                            {problem.domain || '기타'}
                        </span>
                        <h1 className="text-2xl font-bold text-black dark:text-white">
                            문제 {problem.id}
                        </h1>
                    </div>
                    <div className="text-right">
                        {/* Source is hidden until solved */}
                        <p className="font-bold text-lg text-black dark:text-white">{problem.score}점</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="mb-8">
                        <MathRenderer content={problem.body} />
                    </div>

                    {problem.image1 && (
                        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-center">
                            <img src={problem.image1} alt="Problem" className="max-h-[500px] w-auto rounded shadow-sm" style={{ maxWidth: '100%' }} />
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
