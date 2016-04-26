// Request Console View (Node.js)
// 
// To run this sample
//  1. Copy the file to your local machine and give .js extension (i.e. example.js)
//  2. Change "***" to appropriate values
//  3. Install docusign-esign and async packages
//     npm install docusign-esign
//     npm install async
//  4. Execute
//     node example.js 


var docusign = require('docusign-esign'),
  async = require('async');

var integratorKey = process.env.DOCUSIGN_INTEGRATOR_KEY || '***', // Integrator Key associated with your DocuSign Integration
  email = process.env.DOCUSIGN_LOGIN_EMAIL || '***',        // Email for your DocuSign Account
  password = process.env.DOCUSIGN_LOGIN_PASSWORD || '***',    // Password for your DocuSign Account
  docusignEnv = 'demo', // DocuSign Environment generally demo for testing purposes ('www' == production)
  baseUrl = 'https://' + docusignEnv + '.docusign.net/restapi';

async.waterfall(
[
  /////////////////////////////////////////////////////////////////////////////////////
  // Step 1: Login (used to retrieve your accountId and account baseUrl)
  /////////////////////////////////////////////////////////////////////////////////////

  function login(next) {

    // initialize the api client
    var apiClient = new docusign.ApiClient();
    apiClient.setBasePath(baseUrl);

    // create JSON formatted auth header
    var creds = JSON.stringify({
      Username: email,
      Password: password,
      IntegratorKey: integratorKey
    });
    apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

    // assign api client to the Configuration object
    docusign.Configuration.default.setDefaultApiClient(apiClient);

    // login call available off the AuthenticationApi
    var authApi = new docusign.AuthenticationApi();

    // login has some optional parameters we can set
    var loginOps = new authApi.LoginOptions();
    loginOps.setApiPassword('true');
    loginOps.setIncludeAccountIdGuid('true');
    authApi.login(loginOps, function (err, loginInfo, response) {
      if (err) {
        console.error(err.response ? err.response.error : err);
        return;
      }
      if (loginInfo) {
        // list of user account(s)
        // note that a given user may be a member of multiple accounts
        var loginAccounts = loginInfo.getLoginAccounts();
        console.log('LoginInformation: ' + JSON.stringify(loginAccounts));
        next(null, loginAccounts);
      }
    });
  },

  // ===============================================================================
  // Step 2:  Create ConsoleView 
  // ===============================================================================
    function createConsoleView(loginAccounts, next){
    var loginAccount = new docusign.LoginAccount();
    loginAccount = loginAccounts[0];
    var accountId = loginAccount.accountId;

    // instantiate a new envelopesApi object
    var envelopesApi = new docusign.EnvelopesApi();

    // set the url where you want the user to go once they logout of the Console
    var returnUrl = new docusign.ConsoleViewRequest();
    returnUrl.setReturnUrl('https://www.docusign.com/devcenter');

    // call the createConsoleView() API
    envelopesApi.createConsoleView(accountId, returnUrl, function (error, consoleView, response) {
      if (error) {
        console.log('Error: ' + error);
        return;
      }

      if (consoleView) {
        console.log('ConsoleView: ' + JSON.stringify(consoleView));
      }
    });
  }

]);
