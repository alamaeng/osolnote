'use server'

import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
        return { error: '아이디와 비밀번호를 입력해주세요.' }
    }

    // Custom Auth: Check against 'users' table
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

    if (error || !user) {
        return { error: '아이디 또는 비밀번호가 일치하지 않습니다.' }
    }

    // Set session cookie (simple implementation for custom auth)
    // In a real production app, use JWT or proper session management
    const cookieStore = await cookies()
    cookieStore.set('osolnote_user', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })
    cookieStore.set('osolnote_role', user.role || 'student', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })

    redirect('/')
}

export async function signup(formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string
    const signupCode = formData.get('signupCode') as string

    if (!username || !password || !role || !signupCode) {
        return { error: '모든 항목을 입력해주세요.' }
    }

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
    const yy = String(now.getFullYear()).slice(2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const expectedCode = `chunsang${yy}${mm}${dd}`

    if (signupCode !== expectedCode) {
        return { error: '가입 코드가 일치하지 않습니다.' }
    }

    // Check if user exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

    if (existingUser) {
        return { error: '이미 존재하는 사용자입니다.' }
    }

    // Create user
    const { error } = await supabase
        .from('users')
        .insert([{ username, password, role }])

    if (error) {
        console.error('Signup Error:', error)
        return { error: '회원가입 중 오류가 발생했습니다: ' + error.message }
    }

    // Auto login after signup
    const cookieStore = await cookies()
    cookieStore.set('osolnote_user', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })
    cookieStore.set('osolnote_role', role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })

    redirect('/')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('osolnote_user')
    cookieStore.delete('osolnote_role')
    redirect('/login')
}
