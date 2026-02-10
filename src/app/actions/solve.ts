'use server'

import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function checkAnswer(problemId: number, userAnswer: string) {
    const cookieStore = await cookies()
    const username = cookieStore.get('osolnote_user')?.value

    if (!username) {
        return { error: '로그인이 필요합니다.' }
    }

    // 1. Get the problem's correct answer
    const { data: problem, error: fetchError } = await supabase
        .from('problems')
        .select('answer, solution, image2, source')
        .eq('id', problemId)
        .single()

    if (fetchError || !problem) {
        return { error: '문제를 찾을 수 없습니다.' }
    }

    // 2. Compare answer (trim whitespace)
    const isCorrect = problem.answer.trim() === userAnswer.trim()

    // 3. Record history
    const { error: historyError } = await supabase
        .from('solve_history')
        .insert([
            {
                user_id: username,
                problem_id: problemId,
                user_answer: userAnswer,
                is_correct: isCorrect,
            },
        ])

    if (historyError) {
        console.error('History Error:', historyError)
        // We proceed even if history save fails, but ideally should warn
    }

    // 4. Return result
    if (isCorrect) {
        return {
            success: true,
            isCorrect,
            solution: problem.solution,
            solutionImage: problem.image2,
            correctAnswer: problem.answer,
            source: problem.source
        }
    } else {
        return {
            success: true,
            isCorrect,
            // Hide solution for wrong answers
        }
    }
}
