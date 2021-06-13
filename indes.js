const auth   = require('./auth');
const app    = require('./app')

//Login Rutes
app.post('/login/user',  auth.userAuth,  app.login);
app.post('/login/admin',  auth.adminAuth,  app.login);
app.post('/login/owner',  auth.ownerAuth,  app.login);

//user Signup Route
app.post('/signUp/user',  auth.userAuth,  app.signUp);


//forgotPassword
app.post('/forgotPassword/user',  auth.userAuth,  app.forgotPassword);
app.post('/forgotPassword/admin',  auth.adminAuth,  app.forgotPassword);
app.post('/forgotPassword/owner',  auth.ownerAuth,  app.forgotPassword);

//checkMail and change password
app.post('/newPassword',  app.forgotPassword);