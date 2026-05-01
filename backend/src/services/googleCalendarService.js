import { google } from "googleapis";

export const createCalendarEvent = async ({
  accessToken,
  start,
  end,
  summary
}) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary,
    start: { dateTime: start },
    end: { dateTime: end }
  };

  return await calendar.events.insert({
    calendarId: "primary",
    resource: event
  });
};