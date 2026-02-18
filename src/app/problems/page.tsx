import { cookies } from 'next/headers'
import Link from 'next/link'
import { getBookmarkedProblemIds } from '@/app/actions/bookmark'
import { supabase } from '@/lib/supabase'
import ProblemListClient from '@/components/ProblemListClient'

export const revalidate = 0;

export default async function ProblemListPage() {
    const cookieStore = await cookies()
    const username = cookieStore.get('osolnote_user')?.value

    // Fetch problems
    const { data: problems, error } = await supabase
        .from('problems')
        .select('id, subject, domain, title, body, source, score, difficulty, created_at')
        .order('created_at', { ascending: false })

    if (error) {
        return <div>Error loading problems: {error.message}</div>
    }

    // Fetch bookmarks if logged in
    let bookmarkedIds: number[] = []
    if (username) {
        bookmarkedIds = await getBookmarkedProblemIds(username)
    }

    // Ensure types match
    const formattedProblems = problems?.map(p => ({
        ...p,
        subject: p.subject || null,
        domain: p.domain || null,
        title: p.title || null,
        source: p.source || null,
        score: p.score || 0,
        difficulty: p.difficulty || null
    })) || []

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">문제 목록</h1>
                <div className="space-x-3">
                    <Link
                        href="/osolnote"
                        className="px-4 py-2 bg-rose-500 text-white font-semibold rounded hover:bg-rose-600 transition-colors"
                    >
                        틀린문제
                    </Link>
                    <Link
                        href="/osolnote/print"
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition-colors"
                    >
                        복습출력
                    </Link>
                </div>
            </div>
            <ProblemListClient
                initialProblems={formattedProblems}
                initialBookmarkedIds={bookmarkedIds}
                isLoggedIn={!!username}
            />
        </div>
    )
}
