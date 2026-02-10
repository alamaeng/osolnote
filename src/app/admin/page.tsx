'use client'

import { useState, useEffect } from 'react'
import { createProblem, updateProblem, deleteProblem, getAdminProblems } from '@/app/actions/problem'

// Define a type for the problem to avoid implicit any
type Problem = {
    id: number;
    domain: string | null;
    body: string;
    source: string | null;
    answer: string;
    score: number | null;
    solution: string | null;
    image1: string | null;
    image2: string | null;
}

export default function AdminPage() {
    const [password, setPassword] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [mode, setMode] = useState<'create' | 'list' | 'edit'>('list')
    const [message, setMessage] = useState<string | null>(null)

    // Data for editing
    const [problems, setProblems] = useState<Problem[]>([])
    const [editingProblem, setEditingProblem] = useState<Problem | null>(null)

    // Sorting state
    const [sortConfig, setSortConfig] = useState<{ key: keyof Problem; direction: 'ascending' | 'descending' } | null>(null);

    const checkPassword = () => {
        if (password === 'anfruf88') {
            setIsAuthenticated(true)
            fetchProblems()
        } else {
            alert('비밀번호가 틀렸습니다.')
        }
    }

    async function fetchProblems() {
        const data = await getAdminProblems()
        setProblems(data)
    }

    // Sorting logic
    const handleSort = (key: keyof Problem) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedProblems = [...problems].sort((a, b) => {
        if (sortConfig !== null) {
            if (a[sortConfig.key] === null) return 1;
            if (b[sortConfig.key] === null) return -1;

            if (a[sortConfig.key]! < b[sortConfig.key]!) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key]! > b[sortConfig.key]!) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
        }
        return 0;
    });

    async function handleSubmit(formData: FormData) {
        setMessage(null)

        if (mode === 'create') {
            const result = await createProblem(formData)
            if (result.error) setMessage(result.error)
            else {
                setMessage(result.success || '등록 성공')
                alert('문제 등록 성공!')
                const form = document.querySelector('form') as HTMLFormElement
                form.reset()
                fetchProblems() // Refresh list
            }
        } else if (mode === 'edit') {
            const result = await updateProblem(formData)
            if (result.error) setMessage(result.error)
            else {
                setMessage(result.success || '수정 성공')
                alert('문제 수정 성공!')
                setMode('list')
                fetchProblems() // Refresh list
            }
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('정말 삭제하시겠습니까?')) return
        const result = await deleteProblem(id)
        if (result.error) alert(result.error)
        else {
            alert('삭제되었습니다.')
            fetchProblems()
        }
    }

    function startEdit(problem: Problem) {
        setEditingProblem(problem)
        setMode('edit')
        setMessage(null)
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="p-8 bg-white rounded shadow-md">
                    <h2 className="mb-4 text-xl font-bold text-black">관리자 인증</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 mb-4 border rounded bg-white text-black"
                        placeholder="관리자 비밀번호"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') checkPassword()
                        }}
                    />
                    <button
                        onClick={checkPassword}
                        className="w-full px-4 py-2 text-white bg-black rounded"
                    >
                        확인
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">관리자 페이지</h1>
                <div className="space-x-4">
                    <button
                        onClick={() => { setMode('list'); fetchProblems(); setMessage(null); }}
                        className={`px-4 py-2 rounded ${mode === 'list' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        문제 관리 (목록)
                    </button>
                    <button
                        onClick={() => { setMode('create'); setEditingProblem(null); setMessage(null); }}
                        className={`px-4 py-2 rounded ${mode === 'create' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        문제 등록
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded ${message.includes('오류') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {mode === 'list' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('domain')}
                                >
                                    영역 {sortConfig?.key === 'domain' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('score')}
                                >
                                    배점 {sortConfig?.key === 'score' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('source')}
                                >
                                    출처 {sortConfig?.key === 'source' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">내용 (요약)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedProblems.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.domain}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.score}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.source}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{p.body}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => startEdit(p)} className="text-indigo-600 hover:text-indigo-900">수정</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">삭제</button>
                                    </td>
                                </tr>
                            ))}
                            {sortedProblems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">등록된 문제가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {(mode === 'create' || mode === 'edit') && (
                <div className="bg-white p-8 rounded shadow">
                    <h2 className="text-2xl font-bold mb-6 text-black">{mode === 'create' ? '새 문제 등록' : `문제 수정 (ID: ${editingProblem?.id})`}</h2>

                    <form action={handleSubmit} className="space-y-6">
                        {mode === 'edit' && editingProblem && (
                            <input type="hidden" name="id" value={editingProblem.id} />
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">영역 (Domain)</label>
                                <input name="domain" defaultValue={editingProblem?.domain || ''} className="w-full p-2 border rounded bg-white text-black" placeholder="예: 미적분" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">출처 (Source)</label>
                                <input name="source" defaultValue={editingProblem?.source || ''} className="w-full p-2 border rounded bg-white text-black" placeholder="예: 2024 수능" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">정답 (Answer)</label>
                                <input name="answer" defaultValue={editingProblem?.answer || ''} className="w-full p-2 border rounded bg-white text-black" required placeholder="예: 123" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">배점 (Score)</label>
                                <input name="score" type="number" defaultValue={editingProblem?.score || 4} className="w-full p-2 border rounded bg-white text-black" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-black">문제 본문 (Markdown + LaTeX)</label>
                            <textarea
                                name="body"
                                defaultValue={editingProblem?.body || ''}
                                className="w-full p-2 border rounded h-32 font-mono bg-white text-black"
                                required
                                placeholder="문제 내용..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-black">해설 (Solution)</label>
                            <textarea
                                name="solution"
                                defaultValue={editingProblem?.solution || ''}
                                className="w-full p-2 border rounded h-32 font-mono bg-white text-black"
                                placeholder="해설 내용..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">문제 이미지 (2MB 이하)</label>
                                <input
                                    type="file"
                                    name="image1"
                                    accept="image/*"
                                    className="w-full p-2 border rounded bg-white text-black"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file && file.size > 2 * 1024 * 1024) {
                                            alert('이미지 크기는 2MB 이하여야 합니다.');
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                {editingProblem?.image1 && (
                                    <div className="mt-1 flex items-center space-x-2">
                                        <p className="text-xs text-gray-500 overflow-hidden truncate max-w-[150px]">{editingProblem.image1}</p>
                                        <label className="flex items-center space-x-1 text-xs text-red-600 cursor-pointer">
                                            <input type="checkbox" name="delete_image1" value="true" className="rounded text-red-600 focus:ring-red-500" />
                                            <span>삭제</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">해설 이미지 (2MB 이하)</label>
                                <input
                                    type="file"
                                    name="image2"
                                    accept="image/*"
                                    className="w-full p-2 border rounded bg-white text-black"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file && file.size > 2 * 1024 * 1024) {
                                            alert('이미지 크기는 2MB 이하여야 합니다.');
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                {editingProblem?.image2 && (
                                    <div className="mt-1 flex items-center space-x-2">
                                        <p className="text-xs text-gray-500 overflow-hidden truncate max-w-[150px]">{editingProblem.image2}</p>
                                        <label className="flex items-center space-x-1 text-xs text-red-600 cursor-pointer">
                                            <input type="checkbox" name="delete_image2" value="true" className="rounded text-red-600 focus:ring-red-500" />
                                            <span>삭제</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="flex-1 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-bold"
                            >
                                {mode === 'create' ? '등록하기' : '수정완료'}
                            </button>
                            {mode === 'edit' && (
                                <button
                                    type="button"
                                    onClick={() => setMode('list')}
                                    className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                                >
                                    취소
                                </button>
                            )}
                        </div>
                    </form>
                </div >
            )
            }
        </div >
    )
}
