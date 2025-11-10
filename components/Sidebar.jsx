"use client"
import { motion, AnimatePresence } from "framer-motion"
import {
  PanelLeftClose,
  BetweenHorizontalEndIcon,
  SearchIcon,
  Plus,
  Star,
  BiohazardIcon,
  FolderIcon,
  FileText,
  Settings,
  ThumbsUpIcon,
  HelpCircle,
  BellRingIcon,
  Lightbulb,
  BookOpen,
  Sparkles,
  BarChart3,
} from "lucide-react"
import SidebarSection from "./SidebarSection"
import ConversationRow from "./ConversationRow"
import FolderRow from "./FolderRow"
import TemplateRow from "./TemplateRow"
import ThemeToggle from "./ThemeToggle"
import CreateFolderModal from "./CreateFolderModal"
import CreateTemplateModal from "./CreateTemplateModal"
import SearchModal from "./SearchModal"
import SettingsDialog from "./SettingsDialog"
import { cls } from "./utils"
import { useState } from "react"
import { useLocale } from "@/contexts/LocaleContext"

export default function Sidebar({
  open,
  onClose,
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  conversations,
  pinned,
  recent,
  folders,
  folderCounts,
  selectedId,
  onSelect,
  togglePin,
  query,
  setQuery,
  searchRef,
  createFolder,
  createNewChat,
  templates = [],
  setTemplates = () => {},
  onUseTemplate = () => {},
  sidebarCollapsed = false,
  setSidebarCollapsed = () => {},
  onNavigate = () => {},
  onToggleAIAssistant = () => {},
  onToggleLearningPanel = () => {},
}) {
  const { t } = useLocale()
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  const getConversationsByFolder = (folderName) => {
    return conversations.filter((conv) => conv.folder === folderName)
  }

  const handleCreateFolder = (folderName) => {
    createFolder(folderName)
  }

  const handleDeleteFolder = (folderName) => {
    const updatedConversations = conversations.map((conv) =>
      conv.folder === folderName ? { ...conv, folder: null } : conv,
    )
    console.log("Delete folder:", folderName, "Updated conversations:", updatedConversations)
  }

  const handleRenameFolder = (oldName, newName) => {
    const updatedConversations = conversations.map((conv) =>
      conv.folder === oldName ? { ...conv, folder: newName } : conv,
    )
    console.log("Rename folder:", oldName, "to", newName, "Updated conversations:", updatedConversations)
  }

  const handleCreateTemplate = (templateData) => {
    if (editingTemplate) {
      const updatedTemplates = templates.map((t) =>
        t.id === editingTemplate.id ? { ...templateData, id: editingTemplate.id } : t,
      )
      setTemplates(updatedTemplates)
      setEditingTemplate(null)
    } else {
      const newTemplate = {
        ...templateData,
        id: Date.now().toString(),
      }
      setTemplates([...templates, newTemplate])
    }
    setShowCreateTemplateModal(false)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setShowCreateTemplateModal(true)
  }

  const handleRenameTemplate = (templateId, newName) => {
    const updatedTemplates = templates.map((t) =>
      t.id === templateId ? { ...t, name: newName, updatedAt: new Date().toISOString() } : t,
    )
    setTemplates(updatedTemplates)
  }

  const handleDeleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter((t) => t.id !== templateId)
    setTemplates(updatedTemplates)
  }

  const handleUseTemplate = (template) => {
    onUseTemplate(template)
  }

  if (sidebarCollapsed) {
    return (
      <motion.aside
        initial={{ width: 320 }}
        animate={{ width: 64 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="z-50 flex h-full shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-center border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <BetweenHorizontalEndIcon className="h-5 w-5 text-[rgba(197,17,35,1)]" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4 my-5">
          <button
            onClick={createNewChat}
            className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
            title={t("sidebar.newChat")}
          >
            <Plus className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowSearchModal(true)}
            className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
            title={t("common.search")}
          >
            <SearchIcon className="h-5 w-5" />
          </button>

          <div className="w-full border-t border-zinc-200/60 dark:border-zinc-800 my-2" />

          <button
            onClick={onToggleAIAssistant}
            className="rounded-xl p-2 hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:hover:bg-purple-900/30"
            title="AI 代码助手"
          >
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </button>

          <button
            onClick={onToggleLearningPanel}
            className="rounded-xl p-2 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-blue-900/30"
            title="AI学习助手"
          >
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </button>

          <div className="w-full border-t border-zinc-200/60 dark:border-zinc-800 my-2" />

          <button
            onClick={() => onNavigate("prompts")}
            className="rounded-xl p-2 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:hover:bg-amber-900/30"
            title="提示词库"
          >
            <BellRingIcon className="h-5 w-5 dark:text-amber-400 text-[rgba(18,153,173,1)]" />
          </button>

          <button
            onClick={() => onNavigate("learning")}
            className="rounded-xl p-2 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:hover:bg-green-900/30"
            title="学习路径"
          >
            <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
          </button>

          <button
            onClick={() => onNavigate("help")}
            className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
            title="帮助"
          >
            <HelpCircle className="h-5 w-5 text-[rgba(53,189,216,1)]" />
          </button>

          <div className="mt-auto mb-4">
            <button
              onClick={() => {
                console.log("[v0] Opening settings dialog from collapsed sidebar")
                setShowSettingsDialog(true)
              }}
              className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
              title={t("common.settings")}
            >
              <Settings className="h-5 w-5 text-[rgba(50,172,212,1)]" />
            </button>
          </div>
        </div>
      </motion.aside>
    )
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(open || typeof window !== "undefined") && (
          <motion.aside
            key="sidebar"
            initial={{ x: -340 }}
            animate={{ x: open ? 0 : 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={cls(
              "z-50 flex h-full w-80 shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900",
              "fixed inset-y-0 left-0 md:static md:translate-x-0",
            )}
          >
            <div className="flex items-center gap-2 border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm dark:from-zinc-200 dark:to-zinc-300 dark:text-zinc-900 rounded-lg">
                  <ThumbsUpIcon className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold tracking-tight">{t("sidebar.aiAssistant")}</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden md:block rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                  aria-label="Close sidebar"
                  title="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5 text-[rgba(187,21,21,1)]" />
                </button>

                <button
                  onClick={onClose}
                  className="md:hidden rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-3 pt-3">
              <label htmlFor="search" className="sr-only">
                {t("sidebar.searchPlaceholder")}
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="search"
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("sidebar.searchPlaceholder")}
                  onClick={() => setShowSearchModal(true)}
                  onFocus={() => setShowSearchModal(true)}
                  className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950/50"
                />
              </div>
            </div>

            <div className="px-3 pt-3">
              <button
                onClick={createNewChat}
                className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-900 bg-blue-700"
                title={`${t("sidebar.newChat")} (⌘N)`}
              >
                <Plus className="h-4 w-4" /> {t("sidebar.newChat")}
              </button>
            </div>

            <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
              <div className="space-y-2 border-b border-zinc-200/60 pb-4 dark:border-zinc-800">
                <div className="px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">快捷功能</div>

                <button
                  onClick={onToggleAIAssistant}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">AI 代码助手</span>
                </button>

                <button
                  onClick={onToggleLearningPanel}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">AI学习助手</span>
                </button>

                <button
                  onClick={() => onNavigate("prompts")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">提示词库</span>
                </button>

                <button
                  onClick={() => onNavigate("learning")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">学习路径</span>
                </button>

                <button
                  onClick={() => onNavigate("help")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-zinc-700 dark:text-zinc-300">帮助中心</span>
                </button>
              </div>

              <SidebarSection
                icon={<Star className="h-4 w-4 text-[rgba(209,68,68,1)]" />}
                title={t("sidebar.pinned").toUpperCase()}
                collapsed={collapsed.pinned}
                onToggle={() => setCollapsed((s) => ({ ...s, pinned: !s.pinned }))}
              >
                {pinned.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    {t("sidebar.noConversations")}
                  </div>
                ) : (
                  pinned.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<BiohazardIcon className="h-4 w-4 text-[rgba(202,58,58,1)]" />}
                title={t("sidebar.recent").toUpperCase()}
                collapsed={collapsed.recent}
                onToggle={() => setCollapsed((s) => ({ ...s, recent: !s.recent }))}
              >
                {recent.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    {t("sidebar.noConversations")}
                  </div>
                ) : (
                  recent.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                      showMeta
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<FolderIcon className="h-4 w-4" />}
                title={t("sidebar.folders").toUpperCase()}
                collapsed={collapsed.folders}
                onToggle={() => setCollapsed((s) => ({ ...s, folders: !s.folders }))}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Plus className="h-4 w-4" /> {t("sidebar.createFolder")}
                  </button>

                  {folders.map((f) => (
                    <FolderRow
                      key={f.id}
                      name={f.name}
                      count={folderCounts[f.name] || 0}
                      conversations={getConversationsByFolder(f.name)}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      togglePin={togglePin}
                      onDeleteFolder={handleDeleteFolder}
                      onRenameFolder={handleRenameFolder}
                    />
                  ))}
                </div>
              </SidebarSection>

              <SidebarSection
                icon={<FileText className="h-4 w-4" />}
                title={t("sidebar.templates").toUpperCase()}
                collapsed={collapsed.templates}
                onToggle={() => setCollapsed((s) => ({ ...s, templates: !s.templates }))}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateTemplateModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Plus className="h-4 w-4" /> {t("templates.create")}
                  </button>

                  {(Array.isArray(templates) ? templates : []).map((template) => (
                    <TemplateRow
                      key={template.id}
                      template={template}
                      onUseTemplate={handleUseTemplate}
                      onEditTemplate={handleEditTemplate}
                      onRenameTemplate={handleRenameTemplate}
                      onDeleteTemplate={handleDeleteTemplate}
                    />
                  ))}

                  {(!templates || templates.length === 0) && (
                    <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      {t("templates.noTemplates")}
                    </div>
                  )}
                </div>
              </SidebarSection>
            </nav>

            <div className="mt-auto border-t border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log("[v0] Opening settings dialog from sidebar")
                    setShowSettingsDialog(true)
                  }}
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                >
                  <Settings className="h-4 w-4" /> {t("common.settings")}
                </button>
                <div className="ml-auto">
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-zinc-50 p-2 dark:bg-zinc-800/60">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                  JD
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">John Doe</div>
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">Pro workspace</div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => {
          setShowCreateTemplateModal(false)
          setEditingTemplate(null)
        }}
        onCreateTemplate={handleCreateTemplate}
        editingTemplate={editingTemplate}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        togglePin={togglePin}
        createNewChat={createNewChat}
      />

      <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
    </>
  )
}
