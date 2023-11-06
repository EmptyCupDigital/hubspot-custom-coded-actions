const axios = require('axios');
const hubspot = require('@hubspot/api-client');
const accessToken = process.env.YOUR_ACCESS_TOKEN;

exports.main = async (event, callback) => {
    const hubspotClient = new hubspot.Client({
        accessToken: process.env.YOUR_ACCESS_TOKEN // Make sure to set this in your environment variables
    });

    // Assuming originalID is passed from the custom coded workflow action input fields
    const originalID = event.inputFields['hs_object_id'];

   const PublicObjectSearchRequest = { 
     limit: 1, 
     properties: ["dealname","amount","hubspot_owner_id"], 
     filterGroups: [
       {"filters":[
         {"propertyName": "original_deal_id",
          "value": originalID,
          "operator": "EQ"}]}]
   };

   try 
   {
  const apiResponse = await hubspotClient.crm.deals.searchApi.doSearch(PublicObjectSearchRequest);
   console.log(JSON.stringify(apiResponse, null, 2));
     
     if(apiResponse.results)
       {
		const renewalDealID = apiResponse.results[0].id;
		const objectType = "deal";
		const objectId = originalID;
		const toObjectType = "deal";
		const toObjectId = renewalDealID;
		const AssociationSpec = [
  {
    "associationCategory": "USER_DEFINED",
    "associationTypeId": YOUR_ASSOCIATION_TYPE_ID
  }
];
         
        const associationUrl = `https://api.hubapi.com/crm/v4/objects/${objectType}/${objectId}/associations/${toObjectType}/${toObjectId}`;

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
} 
  
  catch (e) 
  {
  e.message === 'HTTP request failed'
    ? console.error(JSON.stringify(e.response, null, 2))
    : console.error(e)
}
  
       
};
