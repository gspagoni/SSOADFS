const request = require('request');

function requestPromise(options) {
    return new Promise(function promisifiedRequest(resolve, reject) {
        request(options, function readResponse(err, res, body) {
            //console.log(from + ":--->    " + body);
            if (err) {
                return reject(err);
            }
            if (res.statusCode === 200 || res.statusCode === 201) {
                    return resolve(body);
            }
            return reject(new Error(`IONAPI responded with status: ${res.statusCode}`));
        });
    });
}


async function getResponseFromAPI(options)
{
	let result = "";
    
	try{
        const response = await requestPromise(options)
		if (!options.mess){
			const responseJson = await JSON.parse(response)
			result = responseJson		    			
		}else{
			result = response
		}
	} catch(e) {
		result = e
	}
	return result
}

module.exports.getResponseFromAPI = getResponseFromAPI;   
