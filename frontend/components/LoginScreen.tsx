"use client"

import { useState } from "react"
import type { LLMOverrides, TreatmentGroup } from "@/lib/types"

interface LoginScreenProps {
  initialUsername: string
  onStart: (
    token: string,
    username: string,
    treatmentGroup?: TreatmentGroup,
    llmOverrides?: LLMOverrides,
  ) => Promise<void>
}

const TREATMENT_OPTIONS: { value: TreatmentGroup; label: string }[] = [
  { value: "low_against", label: "Low incivility · Majority against" },
  { value: "low_mixed", label: "Low incivility · Mixed" },
  { value: "low_favor", label: "Low incivility · Majority in favor" },
  { value: "medium_against", label: "Medium incivility · Majority against" },
  { value: "medium_mixed", label: "Medium incivility · Mixed" },
  { value: "medium_favor", label: "Medium incivility · Majority in favor" },
  { value: "high_against", label: "High incivility · Majority against" },
  { value: "high_mixed", label: "High incivility · Mixed" },
  { value: "high_favor", label: "High incivility · Majority in favor" },
]

type LLMOption = {
  label: string
  provider: string
  model: string
}

const DIRECTOR_OPTIONS: LLMOption[] = [
  { label: "Anthropic · Claude Opus 4.6", provider: "anthropic", model: "claude-opus-4-6" },
  { label: "Anthropic · Claude Sonnet 4", provider: "anthropic", model: "claude-sonnet-4-0" },
  { label: "Konstanz · ALIA 40B", provider: "konstanz", model: "BSC-LT/ALIA-40b-instruct-2601" },
]

const PERFORMER_OPTIONS: LLMOption[] = [
  { label: "Konstanz · ALIA 40B", provider: "konstanz", model: "BSC-LT/ALIA-40b-instruct-2601" },
  { label: "Anthropic · Claude Sonnet 4", provider: "anthropic", model: "claude-sonnet-4-0" },
  { label: "Anthropic · Claude Haiku 4.5", provider: "anthropic", model: "claude-haiku-4-5" },
]

const MODERATOR_OPTIONS: LLMOption[] = [
  { label: "Anthropic · Claude Haiku 4.5", provider: "anthropic", model: "claude-haiku-4-5" },
  { label: "Anthropic · Claude Sonnet 4", provider: "anthropic", model: "claude-sonnet-4-0" },
  { label: "Konstanz · ALIA 40B", provider: "konstanz", model: "BSC-LT/ALIA-40b-instruct-2601" },
]

export default function LoginScreen({
  initialUsername,
  onStart,
}: LoginScreenProps) {
  const [token, setToken] = useState("")
  const [username, setUsername] = useState(initialUsername)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [devMode, setDevMode] = useState(false)
  const [selectedTreatment, setSelectedTreatment] =
    useState<TreatmentGroup>("low_against")

  const [directorModel, setDirectorModel] = useState(DIRECTOR_OPTIONS[0].model)
  const [performerModel, setPerformerModel] = useState(PERFORMER_OPTIONS[0].model)
  const [moderatorModel, setModeratorModel] = useState(MODERATOR_OPTIONS[0].model)

  const buildLLMOverrides = (): LLMOverrides => {
    const director = DIRECTOR_OPTIONS.find((o) => o.model === directorModel) || DIRECTOR_OPTIONS[0]
    const performer = PERFORMER_OPTIONS.find((o) => o.model === performerModel) || PERFORMER_OPTIONS[0]
    const moderator = MODERATOR_OPTIONS.find((o) => o.model === moderatorModel) || MODERATOR_OPTIONS[0]

    return {
      director: { provider: director.provider, model: director.model },
      performer: { provider: performer.provider, model: performer.model },
      moderator: { provider: moderator.provider, model: moderator.model },
    }
  }

  const handleSubmit = async () => {
    if (!devMode && !token.trim()) {
      setError("Please enter a token")
      return
    }
    setLoading(true)
    setError("")
    try {
      await onStart(
        token.trim(),
        username.trim(),
        devMode ? selectedTreatment : undefined,
        devMode ? buildLLMOverrides() : undefined,
      )
    } catch {
      setError(devMode ? "Invalid treatment/model config. Please try again." : "Invalid token. Please try again.")
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center justify-center h-dvh bg-gray-100">
      {/* Header accent */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-header" />

      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Card header */}
        <div className="bg-header px-6 py-5">
          <h1 className="text-white text-xl font-medium m-0">
            Community Chatroom
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Enter your token to join
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-3">
          <label className="flex items-center gap-2 text-xs font-medium text-secondary">
            <input
              type="checkbox"
              checked={devMode}
              onChange={(e) => setDevMode(e.target.checked)}
            />
            Researcher test mode (manual treatment)
          </label>

          {devMode && (
            <>
              <div>
                <label
                  htmlFor="treatment"
                  className="block text-xs font-medium text-secondary mb-1"
                >
                  Treatment (test mode)
                </label>
                <select
                  id="treatment"
                  value={selectedTreatment}
                  onChange={(e) => setSelectedTreatment(e.target.value as TreatmentGroup)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-primary focus:outline-none focus:border-header focus:ring-1 focus:ring-header/30 transition-colors"
                >
                  {TREATMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="directorModel" className="block text-xs font-medium text-secondary mb-1">
                  Director model
                </label>
                <select
                  id="directorModel"
                  value={directorModel}
                  onChange={(e) => setDirectorModel(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-primary focus:outline-none focus:border-header focus:ring-1 focus:ring-header/30 transition-colors"
                >
                  {DIRECTOR_OPTIONS.map((option) => (
                    <option key={option.model} value={option.model}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="performerModel" className="block text-xs font-medium text-secondary mb-1">
                  Performer model
                </label>
                <select
                  id="performerModel"
                  value={performerModel}
                  onChange={(e) => setPerformerModel(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-primary focus:outline-none focus:border-header focus:ring-1 focus:ring-header/30 transition-colors"
                >
                  {PERFORMER_OPTIONS.map((option) => (
                    <option key={option.model} value={option.model}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="moderatorModel" className="block text-xs font-medium text-secondary mb-1">
                  Moderator model
                </label>
                <select
                  id="moderatorModel"
                  value={moderatorModel}
                  onChange={(e) => setModeratorModel(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-primary focus:outline-none focus:border-header focus:ring-1 focus:ring-header/30 transition-colors"
                >
                  {MODERATOR_OPTIONS.map((option) => (
                    <option key={option.model} value={option.model}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-secondary mb-1"
            >
              Display name (optional)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Alice"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-primary focus:outline-none focus:border-header focus:ring-1 focus:ring-header/30 transition-colors placeholder:text-secondary/50"
            />
          </div>
          <div>
            <label
              htmlFor="token"
              className="block text-xs font-medium text-secondary mb-1"
            >
              Participant token
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                if (error) setError("")
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. user0002"
              disabled={devMode}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-primary focus:outline-none focus:border-header focus:ring-1 focus:ring-header/30 transition-colors placeholder:text-secondary/50 disabled:bg-gray-100 disabled:text-secondary/60"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-danger mt-1">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-header hover:bg-header-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Joining..." : "Join Chatroom"}
          </button>
        </div>
      </div>
    </div>
  )
}
