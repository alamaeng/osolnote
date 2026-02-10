'use client'

import { useState } from 'react'
import Link from 'next/link'
import MathRenderer from '@/components/MathRenderer'
import PrintButton from '@/components/PrintButton'

interface Problem {
    id: number
    domain: string
    body: string
    source: string
    answer: string
    solution: string
    is_subjective: boolean
    score: number
    image1: string | null
    image2: string | null
}

interface PrintPageClientProps {
    problems: Problem[]
    username: string
}

export default function PrintPageClient({ problems, username }: PrintPageClientProps) {
    const [itemsPerPage, setItemsPerPage] = useState<number | 'auto'>('auto')

    const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        setItemsPerPage(value === 'auto' ? 'auto' : parseInt(value))
    }

    return (
        <div className="max-w-4xl mx-auto p-8 print:p-0">
            <style>{`
                .print-preview-container { font-size: 14px; }
                .print-preview-container h1 { font-size: 20px; }
                .print-preview-container .problem-header {
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                
                /* Consolidated font size rule for both screen preview and print */
                /* Consolidated font size rule for both screen preview and print */
                .print-content {
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                }

                @media print {
                    @page { margin: 1.5cm 2.5cm; }
                    body { 
                        -webkit-print-color-adjust: exact; 
                        font-size: 14px !important;
                        margin: 0; padding: 0;
                    }
                    .no-print { display: none; }

                    /* Table Layout for Repeating Headers */
                    table { width: 100%; border-collapse: collapse; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    
                    /* Header Styling */
                    .print-header-content {
                        padding-bottom: 10px;
                        border-bottom: 1px solid black;
                        margin-bottom: 20px;
                        /* Ensure header has physical height in flow */
                        height: auto; 
                        display: block;
                    }

                    /* Content Spacing */
                    .print-break { 
                        break-inside: avoid; 
                        page-break-inside: avoid; 
                        margin-bottom: 20px;
                        padding-bottom: 20px;
                        border-bottom: 1px dashed #e5e7eb;
                    }
                    .print-break:last-child { border-bottom: none; }
                    .force-break { break-after: page; page-break-after: always; }
                    
                    h1 { font-size: 20px !important; }
                    .problem-header { font-size: 14px !important; margin-bottom: 4px; }
                }
            `}</style>

            <div className="flex justify-between items-center mb-8 no-print">
                <h1 className="text-xl font-bold">오답 노트 복습 (인쇄 미리보기)</h1>
                <div className="space-x-4 flex items-center">
                    <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded shadow-md border border-gray-700">
                        <span className="text-sm font-bold text-white">페이지당 문제 수:</span>
                        <select value={itemsPerPage} onChange={handleLayoutChange} className="text-sm border-0 rounded px-2 py-1 text-black bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer">
                            <option value="auto">자동 (기본)</option>
                            <option value="1">1문제</option>
                            <option value="2">2문제</option>
                            <option value="3">3문제</option>
                            <option value="4">4문제</option>
                        </select>
                    </div>
                    <PrintButton />
                    <Link href="/osolnote" className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded text-sm transition-colors">돌아가기</Link>
                </div>
            </div>

            {/* Print Table Structure */}
            <table className="w-full">
                <thead>
                    <tr>
                        <td>
                            <div className="hidden print:block mb-8 print-header-content">
                                <div className="flex justify-between items-end">
                                    <h1 className="text-2xl font-bold">Osolnote Review</h1>
                                    <div className="text-right">
                                        <p className="text-base font-medium">{username}님의 오답 노트</p>
                                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div className="space-y-6 print-preview-container">
                                {problems.map((problem, index) => {
                                    let breakClass = 'print-break'
                                    if (itemsPerPage !== 'auto') {
                                        const isLastOnPage = (index + 1) % (itemsPerPage as number) === 0
                                        const isLastItem = index === problems.length - 1
                                        if (isLastOnPage && !isLastItem) breakClass += ' force-break'
                                    }

                                    return (
                                        <div key={problem.id} className={breakClass}>
                                            <div className="flex justify-between text-sm text-gray-500 mb-1 problem-header">
                                                <span className="font-bold bg-gray-100 print:bg-transparent px-2 rounded">#{index + 1}. {problem.domain}</span>
                                                <span>{problem.score}점</span>
                                            </div>
                                            <div className="mb-2 problem-body">
                                                <MathRenderer content={problem.body} className="print-content" />
                                            </div>
                                            {problem.image1 && (
                                                <div className="mb-2 max-w-sm">
                                                    <img src={problem.image1} alt="Problem" className="rounded border" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                {problems.length === 0 && (
                                    <div className="text-center py-20 border rounded text-sm">
                                        <p>복습하기(⭐) 태그된 문제가 없습니다.</p>
                                        <p className="text-xs mt-2">틀린 문제에서 별표를 눌러 추가해보세요.</p>
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <script dangerouslySetInnerHTML={{ __html: `// window.print();` }} />
        </div>
    )
}
