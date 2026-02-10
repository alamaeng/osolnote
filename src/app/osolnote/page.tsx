import { cookies } from 'next/headers'
import Link from 'next/link'
import { getWrongProblemsForUser } from '@/app/actions/problem'
import { getBookmarkedProblemIds } from '@/app/actions/bookmark'
import MathRenderer from '@/components/MathRenderer'
import BookmarkButton from '@/components/BookmarkButton'

export const revalidate = 0

export default async function OsolnotePage() {
    const cookieStore = await cookies()
    const username = cookieStore.get('osolnote_user')?.value

    if (!username) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
                    <Link href="/" className="text-indigo-600 hover:underline">
                        로그인 페이지로 이동
                    </Link>
                </div>
            </div>
        )
    }

    const wrongProblems = await getWrongProblemsForUser(username)
    const bookmarkedIds = await getBookmarkedProblemIds(username)
    const bookmarkedSet = new Set(bookmarkedIds)

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-red-600 mb-2">오답 노트 (Osolnote)</h1>
                    <p className="text-gray-600">
                        {username}님이 마지막으로 시도했을 때 틀린 문제들입니다. ({wrongProblems.length}문제)
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href="/osolnote/print"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold flex items-center"
                    >
                        <span>PDF 출력 (복습하기 ⭐)</span>
                    </Link>
                    <Link
                        href="/problems"
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        전체 문제 목록
                    </Link>
                </div>
            </div>

            <div className="grid gap-8">
                {wrongProblems.map((problem) => (
                    <div key={problem.id} className="bg-white border-2 border-red-100 rounded-xl shadow-sm overflow-hidden p-6 relative">
                        <div className="absolute top-0 right-0 flex">
                            <div className="p-2">
                                <BookmarkButton
                                    problemId={problem.id}
                                    initialIsBookmarked={bookmarkedSet.has(problem.id)}
                                />
                            </div>
                            <div className="bg-red-100 text-red-800 px-3 py-1 text-xs font-bold rounded-bl-lg h-full flex items-center">
                                오답
                            </div>
                        </div>

                        <div className="mb-4 flex items-center space-x-2">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {problem.domain || '기타'}
                            </span>
                            <span className="text-sm text-gray-500">배점: {problem.score}</span>
                        </div>

                        <div className="mb-6">
                            <MathRenderer content={problem.body} />
                            {problem.image1 && (
                                <div className="mt-4">
                                    {/* Use standard img for public display if simple, or updated logic */}
                                    <img src={problem.image1} alt="Problem Image" className="max-w-full h-auto rounded border" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Link
                                href={`/problems/${problem.id}`}
                                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
                            >
                                다시 풀기
                            </Link>
                        </div>
                    </div>
                ))}

                {wrongProblems.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-xl text-green-600 font-bold mb-2">훌륭합니다!</p>
                        <p className="text-gray-500">
                            현재 틀린 문제가 없습니다. 모든 문제를 완벽하게 이해하셨네요.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
