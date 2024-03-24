import { Request, Response } from 'express'
import { authorize, listEvents } from '../calendar.js'

export const getEvents = async (req: Request, res: Response) => {
  const auth = await authorize()
  const events = await listEvents(auth)

  const eventsData = events?.map((event) => ({
    summary: event.summary,
    start: event.start?.dateTime,
    end: event.end?.dateTime,
    location: event.location,
  }))

  res.json(eventsData)
}
