'use client'

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer flex items-center gap-2"
        >
            <span>🖨️ 인쇄하기 (PDF 저장)</span>
        </button>
    )
}
