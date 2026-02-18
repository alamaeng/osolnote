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
        <div className={`w-full text-black dark:text-white leading-relaxed font-semibold math-renderer ${className || 'text-xl'}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkBreaks]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Custom components if needed, e.g. images
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    img: ({ node, ...props }: any) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            {...props}
                            className="w-1/4 max-w-[25%] h-auto block"
                            alt={props.alt || 'image'}
                        />
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    p: ({ node, ...props }: any) => (
                        <p {...props} className="mb-6 last:mb-0 text-black dark:text-white" />
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
