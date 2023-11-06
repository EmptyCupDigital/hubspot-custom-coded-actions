const axios = require('axios');
const hubspot = require('@hubspot/api-client');
const accessToken = process.env.YOUR_ACCESS_TOKEN;

exports.main = async (event, callback) => {
    const hubspotClient = new hubspot.Client({
        accessToken: process.env.YOUR_ACCESS_TOKEN // Make sure to set this in your environment variables
    });

    // The enrolled deal's 'Original Deal ID' property and its Record ID property should be passed in via input fields.
    const originalID = event.inputFields['original_deal_id'];
    const renewalDealID = event.inputFields['hubspot_object_id']

		const objectType = "deal";
		const objectId = renewalDealID;
		const toObjectType = "deal";
		const toObjectId = originalID;
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
};
