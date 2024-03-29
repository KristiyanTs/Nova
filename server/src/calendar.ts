import path from 'path'
import process from 'process'
import { authenticate } from '@google-cloud/local-auth'
import { google } from 'googleapis'
import * as fs from 'fs/promises'

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json')
const CREDENTIALS_PATH = path.join(process.cwd(), '/src/credentials.json')

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH)
    const credentials = JSON.parse(content.toString())
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: any) {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const keys = JSON.parse(content.toString())
  const key = keys.installed || keys.web
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  })
  await fs.writeFile(TOKEN_PATH, payload)
}

/**
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize() {
  let client = await loadSavedCredentialsIfExist()
  if (client) {
    return client
  }
  // @ts-ignore
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })
  // @ts-ignore
  if (client.credentials) {
    await saveCredentials(client)
  }
  return client
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export async function listEvents(auth: any, startDate: string, endDate: string) {
  const calendar = google.calendar({ version: 'v3', auth })
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDate,
    timeMax: endDate,
    singleEvents: true,
    orderBy: 'startTime',
  })
  const events = res.data.items
  return events
}

/**
 * Create a new event on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export const createNewEvent = async (auth: any, event: any) => {
  const calendar = google.calendar({ version: 'v3', auth })

  const calendarObject = {
    calendarId: 'primary',
    resource: event,
  }

  const res = await calendar.events.insert(calendarObject as any)
  return res.data
}

/**
 * Update an event on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} eventId The event ID to update.
 * @param {object} event The new event data.
 * @return {Promise<object>} The updated event.
 *
 */
export const editEvent = async (auth: any, eventId: string, event: any) => {
  const calendar = google.calendar({ version: 'v3', auth })

  const calendarObject = {
    calendarId: 'primary',
    eventId,
    resource: event,
  }

  const res = await calendar.events.update(calendarObject as any)
  return res.data
}

/**
 * Delete an event on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} eventId The event ID to delete.
 * @return {Promise<object>} The deleted event.
 */
export const removeEvent = async (auth: any, eventId: string) => {
  const calendar = google.calendar({ version: 'v3', auth })

  const calendarObject = {
    calendarId: 'primary',
    eventId,
  }

  const res = await calendar.events.delete(calendarObject as any)
  return res.data
}
