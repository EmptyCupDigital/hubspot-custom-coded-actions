const axios = require('axios');

// Replace with your HubSpot API access token
const API_ACCESS_TOKEN = process.env.HUBSPOT_API; // Assuming your Secret is called HUBSPOT_API

// HubSpot API endpoints
const HUBSPOT_CONTACTS_SEARCH_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/search';
const HUBSPOT_CONVERSATIONS_URL = 'https://api.hubapi.com/conversations/v3/conversations/threads';

// Helper function to calculate the date 30 days ago from today
function getDate30DaysAgo() {
  const today = new Date();
  today.setDate(today.getDate() - 30);
  return today.toISOString(); // Convert the date to ISO string for API filtering
}

// Function to get associated contacts for the company using the Search API
async function getAssociatedContacts(companyId) {
  try {
    // Define the search criteria for finding associated contacts
    const searchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'associations.company',
          operator: 'EQ',
          value: companyId
        }]
      }],
      properties: ['hs_object_id'] // Only retrieve the contact ID
    };

    const response = await axios.post(HUBSPOT_CONTACTS_SEARCH_URL, searchPayload, {
      headers: {
        Authorization: `Bearer ${API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.results.map(contact => contact.id); // Return the list of contact IDs
  } catch (error) {
    console.error('Error fetching associated contacts:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch associated contacts.');
  }
}

// Function to get live chat conversations for a contact, filtered by last 30 days
async function getConversations(contactId) {
  try {
    const thirtyDaysAgo = getDate30DaysAgo();

    const response = await axios.get(`${HUBSPOT_CONVERSATIONS_URL}`, {
      headers: {
        Authorization: `Bearer ${API_ACCESS_TOKEN}`,
      },
      params: {
        // Filter for live chat conversations associated with the contact created in the last 30 days
        'latestMessageTimestampAfter': thirtyDaysAgo,
        'sort': 'latestMessageTimestamp',
        'conversationSource': 'LIVE_CHAT',
        'associatedContactId': contactId,
      },
    });
    
    console.log("First Conversation Thread Result: " + JSON.stringify(response.data.results[0]));
    return response.data.results.length; // Return the count of conversations for the contact
  } catch (error) {
    console.error('Error fetching conversations:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch conversations.');
  }
}

// Main function to get the total conversations for a company
async function getTotalConversationsForCompany(companyId) {
  try {
    // Step 1: Fetch all associated contacts
    const contactIds = await getAssociatedContacts(companyId);
	console.log("Contact IDs: " + contactIds);
    let totalConversations = 0;

    // Step 2: Fetch and count conversations for each contact
    for (const contactId of contactIds) {
      const conversationCount = await getConversations(contactId);
      totalConversations += conversationCount;
    }
    console.log("Total Number of Conversations: " + totalConversations);
    return totalConversations;
  } catch (error) {
    console.error('Error calculating total conversations:', error);
    throw error;
  }
}

// HubSpot custom workflow action entry point
exports.main = async (event, callback) => {
  // Extract the company ID from the input event
  const companyId = event.object.objectId; // Assuming 'companyId' is an input field in the workflow

  try {
    const totalConversations = await getTotalConversationsForCompany(companyId);

    // Return the total conversations to the workflow
    callback ({
      outputFields: {
        totalConversationsLast30Days: totalConversations
      }
    });
  } catch (error) {
    console.error('Error in workflow action:', error.message);
    callback ({
      outputFields: {
        totalConversationsLast30Days: 0 // Return 0 in case of failure
      }
    });
  }
};
