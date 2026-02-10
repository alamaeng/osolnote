import { cookies } from 'next/headers'
import { getBookmarkedProblems } from '@/app/actions/problem'
import PrintPageClient from '@/components/PrintPageClient'

export const revalidate = 0

export default async function PrintReviewPage() {
    const cookieStore = await cookies()
    const username = cookieStore.get('osolnote_user')?.value

    if (!username) {
        return <div>로그인이 필요합니다.</div>
    }

    const problems = await getBookmarkedProblems(username)

    return <PrintPageClient problems={problems} username={username} />
}
