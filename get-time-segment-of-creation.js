const hubspot = require('@hubspot/api-client');

const workingHours = {
  // Keys are day numbers: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  1: { start: 9, end: 17 }, // Monday
  2: { start: 9, end: 17 }, // Tuesday
  3: { start: 9, end: 17 }, // Wednesday
  4: { start: 9, end: 17 }, // Thursday
  5: { start: 9, end: 17 }  // Friday
};
const timeZone = 'America/New_York'

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_API });
  const ticketId = event.object.objectId;

  const timeCategory = determineTimeCategory();

  try {
    await hubspotClient.crm.contacts.basicApi.update(ticketId, { properties: { time_segment_of_creation: timeCategory } });
    callback({ outputFields: { result: timeCategory } });
  } catch (error) {
    console.error('Error updating the contact:', error);
    callback();
  }
};

function determineTimeCategory() {
  const now = new Date().toLocaleString('en-US', { timeZone });
  const dateTime = new Date(now);
  const dayOfWeek = dateTime.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const hourOfDay = dateTime.getHours(); // Hour of the day in 24-hour format (0-23)

  if (workingHours[dayOfWeek]) {
    if (hourOfDay >= workingHours[dayOfWeek].start && hourOfDay < workingHours[dayOfWeek].end) {
      return "On-Hours";  // Within defined working hours
    } else {
      return "Off-Hours"; // Outside defined working hours
    }
  } else {
    return "Weekend";    // It's a weekend or a non-defined working day
  }
}
