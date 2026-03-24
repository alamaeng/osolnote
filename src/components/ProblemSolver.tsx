'use client'

import { useState } from 'react'
import { checkAnswer, giveUpAndShowAnswer } from '@/app/actions/solve'
import Image from 'next/image'
import MathRenderer from '@/components/MathRenderer'

interface ProblemSolverProps {
    problemId: number
    role: string
    problemData: {
        answer: string
        solution: string | null
        image2: string | null
        source: string | null
    }
}

export default function ProblemSolver({ problemId, role, problemData }: ProblemSolverProps) {
    const [answer, setAnswer] = useState('')
    const [result, setResult] = useState<{
        isCorrect: boolean;
        solution: string | null;
        solutionImage: string | null;
        correctAnswer: string;
        source: string | null;
    } | null>(() => {
        if (role !== 'student') {
            return {
                isCorrect: true, // Treated as truthy to show the green UI box block
                solution: problemData.solution,
                solutionImage: problemData.image2,
                correctAnswer: problemData.answer,
                source: problemData.source
            }
        }
        return null
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [isGivingUp, setIsGivingUp] = useState(false)

    async function handleGiveUp() {
        if (!confirm('정말 정답을 확인하시겠습니까? (오답으로 기록됩니다)')) return;
        setLoading(true);
        setIsGivingUp(true);
        setError(null);

        try {
            const res = await giveUpAndShowAnswer(problemId);
            if (res.error) {
                setError(res.error);
            } else if (res.success) {
                setResult({
                    isCorrect: res.isCorrect,
                    solution: res.solution,
                    solutionImage: res.solutionImage,
                    correctAnswer: res.correctAnswer,
                    source: res.source
                });
            }
        } catch (err) {
            setError('오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
            setIsGivingUp(false);
        }
    }

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

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading && !isGivingUp ? '채점 중...' : '제출하기'}
                        </button>
                        <button
                            type="button"
                            onClick={handleGiveUp}
                            disabled={loading}
                            className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 disabled:opacity-50"
                        >
                            {isGivingUp ? '확인 중...' : '정답 확인'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className={`p-6 rounded-lg border-2 ${(result.isCorrect || role !== 'student') ? 'bg-green-50 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
                        <h3 className="text-2xl font-bold mb-2">
                            {role !== 'student' ? '정답 및 해설' : (result.isCorrect ? '정답입니다! 🎉' : '틀렸습니다. 다시 도전해보세요.')}
                        </h3>
                        {!result.isCorrect && role === 'student' && (
                            <p className="font-semibold">입력한 답: {answer || '[정답 확인]'}</p>
                        )}
                        {result.correctAnswer && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-start gap-2">
                                    <span className="font-bold whitespace-nowrap">정답:</span>
                                    <MathRenderer content={result.correctAnswer} className="text-base leading-none" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">출처: {result.source || '미상'}</p>
                            </div>
                        )}
                    </div>

                    {result.correctAnswer && (
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

                    {role === 'student' && (
                        <button
                            onClick={() => {
                                setResult(null);
                                setAnswer('');
                            }}
                            className="mt-4 text-indigo-600 hover:underline"
                        >
                            다시 풀기
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
