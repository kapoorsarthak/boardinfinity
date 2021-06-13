const constants   = require('./constants');
const common      = require('./commonfunction');

exports.userAuth = userAuth;
exports.adminAuth = adminAuth;
exports.ownerAuth = ownerAuth

async function userAuth(req, res) {

    const handlerInfo = {
        apiModule  : 'middleware',
		apiHandler : 'userAuth',
		enable_logging: req.body.enable_logging,
    };

    const options = req.body;

    if(options.userType == constants.userType.OWNER || options.userType == constants.userType.ADMIN){
        common.sendErrorResponse(handlerInfo, {message : "UNAUTHENTICATED"}, res, options);
    }
    next();
}

async function adminAuth(req, res) {

    const handlerInfo = {
        apiModule  : 'middleware',
		apiHandler : 'adminAuth',
		enable_logging: req.body.enable_logging,
    };

    const options = req.body;

    if(options.userType == constants.userType.USER){
        common.sendErrorResponse(handlerInfo, {message : "UNAUTHENTICATED"}, res, options);
    }
    next();
}

async function ownerAuth(req, res) {

    const handlerInfo = {
        apiModule  : 'middleware',
		apiHandler : 'ownerAuth',
		enable_logging: req.body.enable_logging,
    };

    const options = req.body;

    if(options.userType == constants.userType.USER || options.userType == constants.userType.ADMIN){
        common.sendErrorResponse(handlerInfo, {message : "UNAUTHENTICATED"}, res, options);
    }
    next();
}