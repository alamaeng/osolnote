import { cookies } from 'next/headers'
import { logout } from './actions/auth'
import Link from 'next/link'

export default async function Home() {
  const cookieStore = await cookies()
  const username = cookieStore.get('osolnote_user')?.value

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 lg:p-24">
      <div className="w-full flex justify-between items-center max-w-5xl font-mono text-sm">
        <p className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          환영합니다, <code className="font-bold">{username}</code>님
        </p>
      </div>

      <div className="text-center z-10">
        <h1 className="text-4xl font-bold mb-4">Osolnote 문제 풀이</h1>
        <p className="text-xl mb-8">문제를 선택하여 풀이를 시작하세요.</p>
        <Link
          href="/problems"
          className="inline-block px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
        >
          문제 보러 가기
        </Link>
      </div>

      <div className="w-full max-w-5xl flex justify-center lg:justify-end">
        <form action={logout}>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            로그아웃
          </button>
        </form>
      </div>
    </main>
  )
}
