import { API_BASE } from "./constants"
import type {
  SessionStartResponse,
  SessionStartRequestPayload,
  TreatmentGroup,
} from "./types"

export async function startSession(
  token: string,
  username?: string,
  treatmentGroup?: TreatmentGroup,
): Promise<SessionStartResponse> {
  const payload: SessionStartRequestPayload = {
    username: username || undefined,
  }

  if (treatmentGroup) {
    payload.treatment_group = treatmentGroup
  } else {
    payload.token = token
  }

  const res = await fetch(`${API_BASE}/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Invalid token or treatment")
  return res.json()
}

export async function likeMessage(
  sessionId: string,
  messageId: string,
  user: string,
) {
  const res = await fetch(
    `${API_BASE}/session/${sessionId}/message/${messageId}/like`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user }),
    },
  )
  if (!res.ok) throw new Error("Network error")
  return res.json()
}

export async function reportMessage(
  sessionId: string,
  messageId: string,
  user: string,
  block: boolean,
) {
  const res = await fetch(
    `${API_BASE}/session/${sessionId}/message/${messageId}/report`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, block }),
    },
  )
  if (!res.ok) throw new Error("Network error")
  return res.json()
}
