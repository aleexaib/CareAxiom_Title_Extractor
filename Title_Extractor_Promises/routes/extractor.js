var express = require('express');
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var Q = require('q');

router.get('/', function(req, res, next) {
	var promises = [];
	var addressArray = req.query["address"];

	//If no address is passed in URL then send response back to the srever.
	if(!req.query["address"]){
		res.render('extractor', { title: 'No URL Provided: ', extractedData: []});
	}
	else{
		//If its single address then convert the sting into object.
		(typeof addressArray != "object")?addressArray=[addressArray]:addressArray;
		
		addressArray.forEach(function(address){
			promises.push(getPageTitle(address));
		});

	    return Q.all(promises).then(function (results) {
	         res.render('extractor', { title: 'Following are the titles of given websites: ', extractedData: results});
	    }).fail(function (error) {
	        res.render('extractor', { title: 'Something Went Wrong On Server: ', extractedData: []});
	    });
	};
});


function getPageTitle(address){
	var defer = Q.defer();
	//Check if URL is complete i.e has http or https;
	var pattern = /^((http)s?:\/\/)/;
	var finalUrl = "";
	var result = "";

	if(!pattern.test(address)) {
	    finalUrl = "http:\/\/" + address;
	}else{
		finalUrl = address;
	}

	//if URL is not valid then no need to hit it just move to next.
	if(!finalUrl || finalUrl === "" ){
		result = address+" - "+"NO RESPONSE";
		defer.resolve(result);
	}
	else{
		request.get(finalUrl, function (err, response, body) {

			if (err) {
				result = address+" - "+"NO RESPONSE";
			}
			else{
				//If status code is >= 400 then just ignore title extraction.
				if(response.statusCode >= 400){
					result = address+" - "+"Not Found";
				}else{
					var html = body;
					var $ = cheerio.load(html);
					var titleTag = $("title").text();
					
					result = address+" - "+titleTag;
				}
			}
			defer.resolve(result);
		});
	};
	return defer.promise; 
};

module.exports = router;


