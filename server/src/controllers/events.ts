import { Request, Response } from 'express'
import {
  authorize,
  listEvents,
  createNewEvent,
  editEvent,
  removeEvent,
} from '../calendar.js'

/**
 * Get all events from the user's primary calendar.
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @return {Promise<void>} The response object.
 * Example request: GET /events?startDate=2021-09-01T00:00:00Z&endDate=2021-09-30T23:59:59Z
 */
export const getEvents = async (req: Request, res: Response) => {
  const auth = await authorize()
  const { startDate, endDate } = req.query as any
  const events = await listEvents(auth, startDate, endDate)

  const eventsData = events?.map((event) => ({
    id: event.id,
    summary: event.summary,
    start: event.start?.dateTime,
    end: event.end?.dateTime,
    location: event.location,
  }))

  res.json(eventsData)
}

/**
  * Create a new event on the user's primary calendar.
  * @param {Request} req The request object.
  * @param {Response} res The response object.
  * @return {Promise<void>} The response object.
  * Example request: POST /events
  * Example body: {
    "summary": "Example Event",
    "location": "Sofia, Bulgaria",
    "description": "This is a test event created via API.",
    "start": {
      "dateTime": "2024-03-25T10:00:00",
      "timeZone": "Europe/Sofia"
    },
    "end": {
      "dateTime": "2024-03-25T11:00:00",
      "timeZone": "Europe/Sofia"
    }
  * }
 */
export const createEvent = async (req: Request, res: Response) => {
  const auth = await authorize()
  const event = req.body

  const newEvent = await createNewEvent(auth, event)

  res.json(newEvent)
}

/**
  * Update an event on the user's primary calendar.
  * @param {Request} req The request object.
  * @param {Response} res The response object.
  * @return {Promise<void>} The response object.
  * Example request: PUT /events/1234567890
  * Example body: {
    "summary": "Updated Event",
    "location": "Sofia, Bulgaria",
    "description": "This is a test event updated via API.",
    "start": {
      "dateTime": "2024-03-25T10:00:00",
      "timeZone": "Europe/Sofia"
    },
    "end": {
      "dateTime": "2024-03-25T11:00:00",
      "timeZone": "Europe/Sofia"
    }
  * }
 */
export const updateEvent = async (req: Request, res: Response) => {
  const auth = await authorize()
  const { eventId } = req.params
  const event = req.body as any

  const updatedEvent = await editEvent(auth, eventId, event)

  res.json(updatedEvent)
}

/**
  * Delete an event on the user's primary calendar.
  * @param {Request} req The request object.
  * @param {Response} res The response object.
  * @return {Promise<void>} The response object.
  * Example request: DELETE /events/1234567890
 */
export const deleteEvent = async (req: Request, res: Response) => {
  const auth = await authorize()
  const { eventId } = req.params

  const deletedEvent = await removeEvent(auth, eventId)

  res.json(deletedEvent)
}
