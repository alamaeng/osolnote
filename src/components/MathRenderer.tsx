'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkBreaks from 'remark-breaks'
import 'katex/dist/katex.min.css'

interface MathRendererProps {
    content: string
}

export default function MathRenderer({ content, className }: MathRendererProps & { className?: string }) {
    return (
        <div className={`w-full text-black dark:text-white leading-relaxed font-semibold ${className || 'text-xl'}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkBreaks]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Custom components if needed, e.g. images
                    img: ({ node, ...props }) => (
                        <img {...props} style={{ maxWidth: '100%', height: 'auto' }} alt={props.alt || 'image'} />
                    ),
                    p: ({ node, ...props }) => (
                        <p {...props} className="mb-6 last:mb-0 text-black dark:text-white" />
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
