exports.sendErrorResponse = sendErrorResponse;
exports.checkEmpty        = checkEmpty;

function sendErrorResponse(handlerInfo, error, res, options = {}) {
	const response =  {
		flag : 404,
		message : error.message
	};

	logging.trace(handlerInfo, {RESPONSE: response});
	res.send(JSON.stringify(response));
}

function checkEmpty(required, incoming) {

	for (let i = 0; i < required.length; i++) {
		const field = required[i];
		if(incoming[field] == undefined || incoming[field] === '') {
			return true;
		}
	}
	return false;
}