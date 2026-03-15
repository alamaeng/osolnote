'use client'

import { useState } from 'react'
import { checkAnswer } from '@/app/actions/solve'
import Image from 'next/image'
import MathRenderer from '@/components/MathRenderer'

interface ProblemSolverProps {
    problemId: number
}

export default function ProblemSolver({ problemId }: ProblemSolverProps) {
    const [answer, setAnswer] = useState('')
    const [result, setResult] = useState<{
        isCorrect: boolean;
        solution: string;
        solutionImage: string;
        correctAnswer: string;
        source: string;
    } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await checkAnswer(problemId, answer)
            if (res.error) {
                setError(res.error)
            } else if (res.success && res.isCorrect !== undefined) {
                setResult({
                    isCorrect: res.isCorrect,
                    solution: res.solution,
                    solutionImage: res.solutionImage,
                    correctAnswer: res.correctAnswer,
                    source: res.source
                })
            }
        } catch (err) {
            setError('오류가 발생했습니다.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-8">
            {!result ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="answer" className="block text-lg font-bold mb-2 text-black dark:text-white">
                            정답 입력 (3자리 이하 정수)
                        </label>
                        <input
                            type="text"
                            id="answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full max-w-xs px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-black"
                            placeholder="답을 입력하세요"
                            maxLength={3}
                            required
                        />
                    </div>

                    {error && <div className="text-red-500 font-bold">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? '채점 중...' : '제출하기'}
                    </button>
                </form>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className={`p-6 rounded-lg border-2 ${result.isCorrect ? 'bg-green-50 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
                        <h3 className="text-2xl font-bold mb-2">
                            {result.isCorrect ? '정답입니다! 🎉' : '틀렸습니다. 다시 도전해보세요.'}
                        </h3>
                        {!result.isCorrect && (
                            <p className="font-semibold">입력한 답: {answer}</p>
                        )}
                        {result.isCorrect && (
                            <div className="mt-4 space-y-2">
                                <p><span className="font-bold">정답: {result.correctAnswer}</span></p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">출처: {result.source || '미상'}</p>
                            </div>
                        )}
                    </div>

                    {result.isCorrect && (
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">해설</h3>
                            {result.solution && <MathRenderer content={result.solution} />}
                            {result.solutionImage && (
                                <div className="mt-4">
                                    <Image
                                        src={result.solutionImage}
                                        alt="Solution"
                                        width={800}
                                        height={600}
                                        className="max-w-full rounded-lg shadow-lg"
                                    />
                                </div>
                            )}
                            {!result.solution && !result.solutionImage && (
                                <p className="text-gray-500">해설이 없습니다.</p>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setResult(null);
                            setAnswer('');
                        }}
                        className="mt-4 text-indigo-600 hover:underline"
                    >
                        다시 풀기
                    </button>
                </div>
            )}
        </div>
    )
}
