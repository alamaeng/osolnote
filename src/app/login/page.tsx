'use client'

import { login, signup } from '@/app/actions/auth'
import { useActionState } from 'react' // or useFormState depending on React version, next.js 14+ uses useFormState usually, but let's stick to standard hooks if possible or use client side handling for simplicity with server actions?
// Using simple form submission for now to avoid experimental hook confusion unless necessary.
// Actually, `useFormState` is standard in Next 14. Let's try basic form action first.
import { useState } from 'react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        const action = isLogin ? login : signup
        const result = await action(formData)
        if (result?.error) {
            setError(result.error)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md text-black">
                <h2 className="text-2xl font-bold text-center text-gray-900">
                    {isLogin ? 'Osolnote 로그인' : '학생 등록'}
                </h2>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            이름 (ID)
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
                            placeholder="이름을 입력하세요"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            비밀번호
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
                            placeholder="비밀번호를 입력하세요"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {isLogin ? '로그인' : '가입하기'}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                        {isLogin ? '계정이 없으신가요? 가입하기' : '이미 계정이 있으신가요? 로그인'}
                    </button>
                </div>
            </div>
        </div>
    )
}
