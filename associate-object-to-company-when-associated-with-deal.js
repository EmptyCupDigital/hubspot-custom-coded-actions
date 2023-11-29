exports.main = async (event, callback) => {
const axios = require('axios');
  
  const recordId = event.inputFields['record_id'];
  const hubspot = require('@hubspot/api-client');
  const accessToken = YOUR_ACCESS_TOKEN;

const hubspotClient = new hubspot.Client({"accessToken":YOUR_ACCESS_TOKEN});

const BatchInputPublicObjectId = { inputs: [{"id":recordId}] };
  
  let yourObjectId;
  let companyId;

try {
  const customObjectResponse = await hubspotClient.crm.associations.batchApi.read("deal", "YOUR_OBJECT", BatchInputPublicObjectId);
  console.log(JSON.stringify(customObjectResponse, null, 2));
  yourObjectId = customObjectResponse.results[0].to[0].id;
} catch (e) {
  e.message === 'HTTP request failed'
    ? console.error(JSON.stringify(e.response, null, 2))
    : console.error(e)
}
  
  try {
  const companyResponse = await hubspotClient.crm.associations.batchApi.read("deal", "company", BatchInputPublicObjectId);
  console.log(JSON.stringify(companyResponse, null, 2));
  companyId = companyResponse.results[0].to[0].id;
} catch (e) {
  e.message === 'HTTP request failed'
    ? console.error(JSON.stringify(e.response, null, 2))
    : console.error(e)
}
  
  const objectType = "YOUR_OBJECT_TYPE";
  const toObjectType = "company"
  
  const AssociationSpec = [
  {
    "associationCategory": "USER_DEFINED",
    "associationTypeId": YOUR_ASSOCIATION_TYPE_ID
  }
];
  
  const associationUrl = `https://api.hubapi.com/crm/v4/objects/${objectType}/${yourObjectId}/associations/${toObjectType}/${companyId}`;

try {
                const associationApiResponse = await axios.put(associationUrl, AssociationSpec, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(JSON.stringify(associationApiResponse.data, null, 2));
            } catch (e) {
                if (e.response) {
                    // Handle HTTP errors here
                    console.error(JSON.stringify(e.response.data, null, 2));
                } else {
                    console.error(e);
                }
            }     
}
