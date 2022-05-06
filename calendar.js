const MY_NOTION_TOKEN = "YOUR_NOTION_TOKEN";
const DATABASE_ID = "TARGET_DATABASE_ID";

function main() {
  logSyncedEvents("primary", false);
}

/**
 * Retrieve and log events from the given calendar that have been modified
 * since the last sync. If the sync token is missing or invalid, log all
 * events from up to a month ago (a full sync).
 *
 * @param {string} calendarId The ID of the calender to retrieve events from.
 * @param {boolean} fullSync If true, throw out any existing sync token and
 *        perform a full sync; if false, use the existing sync token if possible.
 */
function logSyncedEvents(calendarId, fullSync) {
  var properties = PropertiesService.getUserProperties();
  var options = {
    maxResults: 100,
  };
  var syncToken = properties.getProperty("syncToken");
  if (syncToken && !fullSync) {
    options.syncToken = syncToken;
  } else {
    // Sync events up to thirty days in the past.
    options.timeMin = getRelativeDate(-30, 0).toISOString();
  }

  // Retrieve events one page at a time.
  var events;
  var pageToken;
  do {
    try {
      options.pageToken = pageToken;
      events = Calendar.Events.list(calendarId, options);
    } catch (e) {
      // Check to see if the sync token was invalidated by the server;
      // if so, perform a full sync instead.
      if (
        e.message === "Sync token is no longer valid, a full sync is required."
      ) {
        properties.deleteProperty("syncToken");
        logSyncedEvents(calendarId, true);
        return;
      } else {
        throw new Error(e.message);
      }
    }

    if (events.items && events.items.length > 0) {
      for (var i = 0; i < events.items.length; i++) {
        var event = events.items[i];
        if (event.status === "cancelled") {
          console.log("Event id %s was cancelled.", event.id);
        } else {
          var start;
          var end;
          if (event.start.date) {
            // All-day event.
            var start = new Date(event.start.date);
            var end = new Date(event.end.date);
            console.log("%s (%s)", event.summary, start.toLocaleDateString());
          } else {
            // Events that don't last all day; they have defined start times.
            var start = new Date(event.start.dateTime);
            var end = new Date(event.end.dateTime);
            console.log("%s (%s)", event.summary, start.toLocaleString());
          }
          createNewPageInJournal(
            event.summary,
            start,
            end,
            event.attendees,
            false
          );
        }
      }
    } else {
      console.log("No events found.");
    }

    pageToken = events.nextPageToken;
  } while (pageToken);

  properties.setProperty("syncToken", events.nextSyncToken);
}

function getRelativeDate(daysOffset, hour) {
  var date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

function getNotionHeaders() {
  return {
    Authorization: `Bearer ${MY_NOTION_TOKEN}`,
    Accept: "application/json",
    "Notion-Version": "2022-02-22",
    "Content-Type": "application/json",
  };
}

function createNewPageInJournal(
  title,
  startDate,
  endDate,
  attendees,
  debug = false
) {
  const create_page_url = "https://api.notion.com/v1/pages";
  const data = {
    parent: {
      database_id: DATABASE_ID,
    },
    icon: {
      type: "emoji",
      emoji: "📆",
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      Date: {
        date: {
          start: getFormattedDateString(startDate),
          end: getFormattedDateString(endDate),
          time_zone: "Asia/Kolkata",
        },
      },
      Tags: {
        multi_select: [{ name: "Journal Entry" }],
      },
      Debug: {
        checkbox: debug,
      },
    },
  };

  if (attendees != undefined) {
    const attendeeString = convertAttendeesToString(attendees);
    data["children"] = [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "Attendees",
                link: null,
              },
            },
          ],
          color: "default",
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: attendeeString,
                link: null,
              },
            },
          ],
          color: "default",
        },
      },
    ];
  }

  const response = UrlFetchApp.fetch(create_page_url, {
    headers: getNotionHeaders(),
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
  });
  // const responseData = JSON.parse(response.getContentText())
  // console.log(responseData)
  console.log(response.getResponseCode());
}

function convertAttendeesToString(attendees) {
  return attendees.reduce((acc, attendee) => {
    return `${acc}\n${attendee.email} ${
      attendee.displayName ? " - " + attendee.displayName : ""
    }`;
  }, "");
}

function getPagesFromJournal() {
  const query_url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
  const data = {
    page_size: 20,
  };
  const response = UrlFetchApp.fetch(query_url, {
    headers: getNotionHeaders(),
    payload: JSON.stringify(data),
  });
  const responseData = JSON.parse(response.getContentText());
  console.log(responseData);
  for (page of responseData.results) {
    console.log(page.properties);
  }
}

function getFormattedDateString(date) {
  return Utilities.formatDate(date, "IST", "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}
