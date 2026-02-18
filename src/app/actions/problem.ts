'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Helper to upload file
async function uploadImage(file: File): Promise<string | null> {
    if (!file || file.size === 0) return null

    if (file.size > 2 * 1024 * 1024) {
        throw new Error('이미지 사이즈가 2MB를 초과했습니다.')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

    if (uploadError) {
        throw new Error('이미지 업로드 실패: ' + uploadError.message)
    }

    const { data } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

    return data.publicUrl
}

export async function createProblem(formData: FormData) {
    const subject = formData.get('subject') as string
    const domain = formData.get('domain') as string
    const title = formData.get('title') as string
    const body = formData.get('body') as string
    const source = formData.get('source') as string
    const answer = formData.get('answer') as string
    const score = formData.get('score') as string
    const difficulty = formData.get('difficulty') as string
    const solution = formData.get('solution') as string

    // Handle file uploads
    const image1File = formData.get('image1') as File
    const image2File = formData.get('image2') as File

    try {
        let image1 = null
        let image2 = null

        if (image1File && image1File.size > 0) {
            image1 = await uploadImage(image1File)
        }
        if (image2File && image2File.size > 0) {
            image2 = await uploadImage(image2File)
        }

        if (!body || !answer) {
            return { error: '문제 본문과 정답은 필수입니다.' }
        }

        const { error } = await supabase
            .from('problems')
            .insert([
                {
                    subject,
                    domain,
                    title,
                    body,
                    source,
                    answer,
                    score: score ? parseInt(score) : 0,
                    difficulty: difficulty ? parseInt(difficulty) : 0,
                    solution,
                    image1,
                    image2,
                },
            ])

        if (error) {
            console.error('Problem Creation Error:', error)
            return { error: '문제 등록 중 오류가 발생했습니다: ' + error.message }
        }

        revalidatePath('/admin')
        revalidatePath('/problems')
        return { success: '문제가 성공적으로 등록되었습니다.' }
    } catch (e: unknown) {
        let message = '알 수 없는 오류가 발생했습니다.'
        if (e instanceof Error) message = e.message
        return { error: message }
    }
}

export async function getAdminProblems() {
    const { data: problems, error } = await supabase
        .from('problems')
        .select('id, subject, domain, title, source, created_at, body, answer, score, difficulty, solution, image1, image2')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Fetch Error:', error)
        return []
    }
    return problems
}

export async function updateProblem(formData: FormData) {
    const id = formData.get('id') as string
    const subject = formData.get('subject') as string
    const domain = formData.get('domain') as string
    const title = formData.get('title') as string
    const body = formData.get('body') as string
    const source = formData.get('source') as string
    const answer = formData.get('answer') as string
    const score = formData.get('score') as string
    const difficulty = formData.get('difficulty') as string
    const solution = formData.get('solution') as string

    const image1File = formData.get('image1') as File
    const image2File = formData.get('image2') as File

    try {
        if (!id || !body || !answer) {
            return { error: '필수 항목이 누락되었습니다.' }
        }

        // Prepare update object
        const updateData: {
            subject: string
            domain: string
            title: string
            body: string
            source: string
            answer: string
            score: number
            difficulty: number
            solution: string
            image1?: string | null
            image2?: string | null
        } = {
            subject,
            domain,
            title,
            body,
            source,
            answer,
            score: score ? parseInt(score) : 0,
            difficulty: difficulty ? parseInt(difficulty) : 0,
            solution,
        }

        // Handle image updates or deletion
        if (formData.get('delete_image1') === 'true') {
            updateData.image1 = null
        } else if (image1File && image1File.size > 0) {
            updateData.image1 = await uploadImage(image1File)
        }

        if (formData.get('delete_image2') === 'true') {
            updateData.image2 = null
        } else if (image2File && image2File.size > 0) {
            updateData.image2 = await uploadImage(image2File)
        }

        const { error } = await supabase
            .from('problems')
            .update(updateData)
            .eq('id', id)

        if (error) {
            console.error('Update Error:', error)
            return { error: '수정 중 오류가 발생했습니다: ' + error.message }
        }

        revalidatePath('/admin')
        revalidatePath(`/problems/${id}`)
        revalidatePath('/problems')
        return { success: '문제가 성공적으로 수정되었습니다.' }
    } catch (e: unknown) {
        let message = '알 수 없는 오류가 발생했습니다.'
        if (e instanceof Error) message = e.message
        return { error: message }
    }
}

export async function deleteProblem(id: number) {
    const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: '삭제 중 오류가 발생했습니다.' }
    }

    revalidatePath('/admin')
    revalidatePath('/problems')
    return { success: '문제가 삭제되었습니다.' }
}

export async function getWrongProblemsForUser(username: string) {
    // 1. Fetch all solve history for the user, ordered by latest first
    const { data: history, error: historyError } = await supabase
        .from('solve_history')
        .select('problem_id, is_correct, created_at')
        .eq('user_id', username)
        .order('created_at', { ascending: false })

    if (historyError) {
        console.error('Error fetching history:', historyError)
        return []
    }

    // 2. Determine the latest status for each problem
    const latestStatus = new Map<number, boolean>()
    history?.forEach((entry) => {
        if (!latestStatus.has(entry.problem_id)) {
            latestStatus.set(entry.problem_id, entry.is_correct)
        }
    })

    // 3. Filter for problems where the latest attempt was WRONG (false)
    const wrongProblemIds = Array.from(latestStatus.entries())
        .filter(([, isCorrect]) => !isCorrect)
        .map(([id]) => id)

    if (wrongProblemIds.length === 0) {
        return []
    }

    // 4. Fetch the actual problem details
    const { data: problems, error: problemsError } = await supabase
        .from('problems')
        .select('*')
        .in('id', wrongProblemIds)
        .order('created_at', { ascending: false })

    if (problemsError) {
        console.error('Error fetching problems:', problemsError)
        return []
    }


    return problems
}

export async function getBookmarkedProblems(username: string) {
    const { data: bookmarks, error: bookmarkError } = await supabase
        .from('review_bookmarks')
        .select('problem_id')
        .eq('user_id', username)

    if (bookmarkError) {
        console.error('Bookmark fetch error', bookmarkError)
        return []
    }

    const ids = bookmarks.map(b => b.problem_id)
    if (ids.length === 0) return []

    const { data: problems, error } = await supabase
        .from('problems')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Problem fetch error', error)
        return []
    }

    return problems
}

export async function bulkCreateProblems(problems: any[]) {
    if (!problems || !Array.isArray(problems) || problems.length === 0) {
        return { error: '데이터가 없습니다.' }
    }

    try {
        const { error } = await supabase
            .from('problems')
            .insert(problems)

        if (error) {
            console.error('Bulk Insert Error:', error)
            return { error: '일괄 등록 중 오류가 발생했습니다: ' + error.message }
        }

        revalidatePath('/admin')
        revalidatePath('/problems')
        return { success: `${problems.length}개의 문제가 성공적으로 등록되었습니다.` }
    } catch (e: unknown) {
        let message = '알 수 없는 오류가 발생했습니다.'
        if (e instanceof Error) message = e.message
        return { error: message }
    }
}
