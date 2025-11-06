import { cls } from "./utils"
import CodePlayground from "./CodePlayground"

export default function Message({ role, children, codeBlock }) {
  const isUser = role === "user"

  const hasCodeBlock = codeBlock || (typeof children === "string" && children.includes("```"))

  return (
    <div className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
          AI
        </div>
      )}
      <div
        className={cls(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isUser
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800",
        )}
      >
        {hasCodeBlock && codeBlock ? (
          <div className="space-y-2">
            <div className="whitespace-pre-wrap">{children}</div>
            <div className="mt-2 h-96 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              <CodePlayground code={codeBlock} />
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{children}</div>
        )}
      </div>
      {isUser && (
        <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
          JD
        </div>
      )}
    </div>
  )
}
