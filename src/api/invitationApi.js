import api from './api'

const ensureClubId = (clubId) => {
  if (!clubId || typeof clubId !== 'string' || !clubId.trim()) {
    throw new Error('clubId is required')
  }
  return clubId.trim()
}

export const sendInvitation = (payload) => {
  const clubId = ensureClubId(payload?.clubId)
  if (!payload?.userId) throw new Error('userId is required')
  const message = String(payload?.message || '').trim()

  return api.post('/invitations/invite', {
    // Request schema format.
    user_id: payload.userId,
    club_id: clubId,
    ...(message ? { message } : {}),
    type: 1,
    status: 0,
    // Compatibility keys for older handlers.
    userId: payload.userId,
    clubId,
    ...(message ? { inviteMessage: message } : {}),
  })
}

export const getClubInvitations = (params = {}) => {
  const clubId = ensureClubId(params.clubId)
  const query = {
    clubId,
    ...(params.page ? { page: params.page } : {}),
    ...(params.limit ? { limit: params.limit } : {}),
    ...(params.status ? { status: params.status } : {}),
  }

  return api.get('/invitations/club-list', {
    params: query,
  })
}

export const getReceivedInvitations = (params = {}) => {
  const query = {
    ...(params.page ? { page: params.page } : {}),
    ...(params.limit ? { limit: params.limit } : {}),
    ...(params.status ? { status: params.status } : {}),
  }

  return api.get('/invitations/received', { params: query })
}

export const getInvitationDetail = (invitationId) =>
  api.get(`/invitations/${invitationId}`)

export const cancelInvitation = (invitationId, clubId) =>
  api.patch(`/invitations/${invitationId}/cancel`, { clubId: ensureClubId(clubId) })

export const resendInvitation = (invitationId, clubId) =>
  api.post(`/invitations/${invitationId}/resend`, { clubId: ensureClubId(clubId) })

export const respondReceivedInvitation = (invitationId, clubId, status) => {
  const normalizedStatus = Number(status)
  if (normalizedStatus !== 1 && normalizedStatus !== 2) {
    throw new Error('status must be 1 (accept) or 2 (reject)')
  }

  const body = {
    status: normalizedStatus,
    clubId: ensureClubId(clubId),
  }

  return api.patch(`/invitations/${invitationId}/respond`, body)
}

const requestWithFallback = async (attempts) => {
  let lastError = null
  for (const attempt of attempts) {
    try {
      if (attempt.method === 'post') {
        return await api.post(attempt.url, attempt.body || {})
      }
      return await api.patch(attempt.url, attempt.body || {})
    } catch (error) {
      const status = error?.response?.status
      lastError = error
      if (status === 404 || status === 405) {
        continue
      }
      throw error
    }
  }

  if (lastError) throw lastError
  throw new Error('No invitation response endpoint available')
}

export const acceptInvitation = (invitationId, clubId) => {
  const bodyWithClub = clubId ? { clubId: ensureClubId(clubId) } : {}
  return requestWithFallback([
    { method: 'patch', url: `/invitations/${invitationId}/respond`, body: { action: 'accept', ...bodyWithClub } },
    { method: 'post', url: `/invitations/${invitationId}/respond`, body: { action: 'accept', ...bodyWithClub } },
    { method: 'patch', url: `/invitations/${invitationId}/accept`, body: bodyWithClub },
    { method: 'post', url: `/invitations/${invitationId}/accept`, body: bodyWithClub },
    { method: 'patch', url: `/invitations/${invitationId}/approve`, body: bodyWithClub },
    { method: 'post', url: `/invitations/${invitationId}/approve`, body: bodyWithClub },
  ])
}

export const rejectInvitation = (invitationId, clubId) => {
  const bodyWithClub = clubId ? { clubId: ensureClubId(clubId) } : {}
  return requestWithFallback([
    { method: 'patch', url: `/invitations/${invitationId}/respond`, body: { action: 'reject', ...bodyWithClub } },
    { method: 'post', url: `/invitations/${invitationId}/respond`, body: { action: 'reject', ...bodyWithClub } },
    { method: 'patch', url: `/invitations/${invitationId}/reject`, body: bodyWithClub },
    { method: 'post', url: `/invitations/${invitationId}/reject`, body: bodyWithClub },
    { method: 'patch', url: `/invitations/${invitationId}/decline`, body: bodyWithClub },
    { method: 'post', url: `/invitations/${invitationId}/decline`, body: bodyWithClub },
  ])
}
