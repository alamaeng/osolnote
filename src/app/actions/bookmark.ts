'use server'

import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function toggleBookmark(problemId: number, isCurrentlyBookmarked: boolean) {
    const cookieStore = await cookies()
    const username = cookieStore.get('osolnote_user')?.value

    if (!username) {
        return { error: '로그인이 필요합니다.' }
    }

    if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
            .from('review_bookmarks')
            .delete()
            .eq('user_id', username)
            .eq('problem_id', problemId)

        if (error) {
            console.error('Bookmark remove error', error)
            return { error: '북마크 해제 실패' }
        }
    } else {
        // Add bookmark
        const { error } = await supabase
            .from('review_bookmarks')
            .insert([{ user_id: username, problem_id: problemId }])

        if (error) {
            console.error('Bookmark add error', error)
            return { error: '북마크 추가 실패' }
        }
    }

    revalidatePath('/osolnote')
    return { success: true }
}

export async function getBookmarkedProblemIds(username: string): Promise<number[]> {
    const { data, error } = await supabase
        .from('review_bookmarks')
        .select('problem_id')
        .eq('user_id', username)

    if (error) {
        console.error('Fetch bookmarks error', error)
        return []
    }

    return data.map(row => row.problem_id)
}
