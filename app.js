const constants   = require('./constants');
const common      = require('./commonfunction');

exports.login = login;
exports.signUp = signUp;
exports.forgotPassword = forgotPassword;
exports.newPassword = newPassword;

async function login(req, res) {

    const handlerInfo = {
        apiModule  : 'app',
		apiHandler : 'login',
		enable_logging: req.body.enable_logging,
    };

    const options = req.body;

    const schema = Joi.object().keys({
        password     : Joi.required(),
        email        : Joi.string().email({ tlds: { allow: false } }),
        userType     : Joi.number().integer().min(0).required(),
	})
	.options({allowUnknown: true});

    const result = Joi.validate(options, schema);

    if(result.error){
        logging.error(handlerInfo, {EVENT: "parameters missing"}, {ERROR: result.error});
        return common.sendErrorResponse(handlerInfo, {message : "PARAMETER MISSING"}, res, options);
    }

    const password = options.password;
    const email = options.email;
    const userType = options.userType;

    try {
        var userExist = await authUser(handlerInfo, password, email, userType);

        if(!userExist){
            logging.error(handlerInfo, {EVENT: "USER O EXIST"}, {});
            return common.sendErrorResponse(handlerInfo, {message : "USER DOES NOT EXIST"}, res, options);
        }

        const response = {
            flag: 200,
            message: "SUCCESS"
        };
        res.send(response);
    }
    catch(error) {
        logging.error(handlerInfo, {ERROR: error.stack});
        common.sendErrorResponse(handlerInfo, error, res, options);
    }

    async function authUser(handlerInfo, password, email, userType){
        const sqlQuery = `SELECT 
                        email, password
                    FROM 
                        tb_users
                    WHERE
                        password = ? 
                        AND user_type = ?
                        AND email = ?`;
        
        const values = [password, userType, email];

        const queryObj =  {
            query: sqlQuery,
            args: values,
            event: 'Fetching users details'
        };

        return db.executeQuery(handlerInfo, queryObj);
    }
}

async function signUp(req, res){
    const handlerInfo = {
        apiModule  : 'app',
		apiHandler : 'signUp',
		enable_logging: req.body.enable_logging,
    };

    const options = req.body;

    const schema = Joi.object().keys({
        password     : Joi.required(),
        email        : Joi.string().email({ tlds: { allow: false } }),
        userType     : Joi.number().integer().min(0).required(),
	})
	.options({allowUnknown: true});

    const result = Joi.validate(options, schema);

    if(result.error){
        logging.error(handlerInfo, {EVENT: "parameters missing"}, {ERROR: result.error});
        return common.sendErrorResponse(handlerInfo, {message : "PARAMETER MISSING"}, res, options);
    }

    const password = options.password;
    const email = options.email;
    const userType = options.userType;

    try {
        insrertUser(handlerInfo, password, email, userType);

        const response = {
            flag: 200,
            message: "SUCCESS"
        };
        res.send(response);
    }
    catch(error) {
        logging.error(handlerInfo, {ERROR: error.stack});
        common.sendErrorResponse(handlerInfo, error, res, options);
    }

    async function insrertUser(handlerInfo, password, email, userType){
        const sqlQuery = `INSERT INTO 
                            tb_users 
                                ('email','password','user_type') 
                            VALUES 
                                (?, ?, ?)`;
            
        const values = [email, password, userType,];

        const queryObj =  {
            query: sqlQuery,
            args: values,
            event: 'INSERTING users details'
        };

        return db.executeQuery(handlerInfo, queryObj);
    }

}

async function forgotPassword(req, res){
    const handlerInfo = {
        apiModule  : 'app',
		apiHandler : 'forgotPassword',
		enable_logging: req.body.enable_logging,
    };

    const options = req.body;

    const schema = Joi.object().keys({
        email        : Joi.string().email({ tlds: { allow: false } }),
        userType     : Joi.number().integer().min(0).required(),
	})
	.options({allowUnknown: true});

    const result = Joi.validate(options, schema);

    if(result.error){
        logging.error(handlerInfo, {EVENT: "parameters missing"}, {ERROR: result.error});
        return common.sendErrorResponse(handlerInfo, {message : "PARAMETER MISSING"}, res, options);
    }

    const email = options.email;
    const userType = options.userType;
    const newPasswordForCRC = random();

    try {

        var isreset = await resetPassword(handlerInfo, newPasswordForCRC, email, userType);

        if(isreset){
            await sendPasswordResetMail(newPasswordForCRC, email)
        }

        const response = {
            flag: 200,
            message: "SUCCESS"
        };
        res.send(response);
    }
    catch(error) {
        logging.error(handlerInfo, {ERROR: error.stack});
        common.sendErrorResponse(handlerInfo, error, res, options);
    }

    async function sendPasswordResetMail(handlerInfo, newPasswordForCRC, email){
        const data = {
            "subject"      : "PASSWORD RESET",
            "from"         : "test@test.com",
            "to"           : email,
            "bcc"          : "",
            "cc"           : "",
            "h:Reply-To"    : "",
            "html"       : newPasswordForCRC
        };

        return await mailgun.messages().send(data);
    }
}

async function resetPassword(handlerInfo, newPasswordForCRC, email, userType){
    const sqlQuery = `UPDATE tb_users
                    SET 
                        password = ?
                    WHERE
                        AND user_type = ?
                        AND email = ?`;
    
    const values = [newPasswordForCRC, userType, email];

    const queryObj =  {
        query: sqlQuery,
        args: values,
        event: 'Updating users details'
    };

    return db.executeQuery(handlerInfo, queryObj);
}

async function newPassword(req, res){
    const handlerInfo = {
        apiModule  : 'app',
		apiHandler : 'newPassword',
		enable_logging: req.body.enable_logging,
    };

    const options = req.body;

    const schema = Joi.object().keys({
        email        : Joi.string().email({ tlds: { allow: false } }),
        userType     : Joi.number().integer().min(0).required(),
        mailPassword : Joi.required(),
        newPassword  : Joi.required(),
	})
	.options({allowUnknown: true});

    const result = Joi.validate(options, schema);

    if(result.error){
        logging.error(handlerInfo, {EVENT: "parameters missing"}, {ERROR: result.error});
        return common.sendErrorResponse(handlerInfo, {message : "PARAMETER MISSING"}, res, options);
    }

    const email = options.email;
    const userType = options.userType;
    const newPasswordForCRC = options.mailPassword;
    const newPassword = options.newPassword;

    try {

        var isUser = await checkMailPassword(handlerInfo, newPasswordForCRC, email, userType);

        if(!isUser){
            return common.sendErrorResponse(handlerInfo, {message: "UNAUTH"}, res, options);
        }
        
        await resetPassword(handlerInfo, newPassword, email, userType);

        const response = {
            flag: 200,
            message: "SUCCESS"
        };
        res.send(response);
    }
    catch(error) {
        logging.error(handlerInfo, {ERROR: error.stack});
        common.sendErrorResponse(handlerInfo, error, res, options);
    }

    async function checkMailPassword(handlerInfo, newPasswordForCRC, email, userType){
        const sqlQuery = `SELECT *
                        FROM 
                                tb_users
                        WHERE
                            password = ?
                            AND user_type = ?
                            AND email = ?`;
        
        const values = [newPasswordForCRC, userType, email];

        const queryObj =  {
            query: sqlQuery,
            args: values,
            event: 'FETCHING users details'
        };

        return db.executeQuery(handlerInfo, queryObj);
    }

}
