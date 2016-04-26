// Download Envelope Documents (Node.js)
// 
// To run this sample
//  1. Copy the file to your local machine and give .js extension (i.e. example.js)
//  2. Change "***" to appropriate values
//  3. Install docusign-esign, async, and fs packages
//     npm install docusign-esign
//     npm install fs
//     npm install async
//  4. Execute
//     node example.js 


var docusign = require('docusign-esign'),
  async = require('async'),
  fs = require('fs');

var integratorKey = process.env.DOCUSIGN_INTEGRATOR_KEY || '***', // Integrator Key associated with your DocuSign Integration
  email = process.env.DOCUSIGN_LOGIN_EMAIL || '***',        // Email for your DocuSign Account
  password = process.env.DOCUSIGN_LOGIN_PASSWORD || '***',    // Password for your DocuSign Account
  envelopeId = '***',   // Individual Envelope ID
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

  /////////////////////////////////////////////////////////////////////////////////////
  // Step 2: Get Envelope Documents
  /////////////////////////////////////////////////////////////////////////////////////

  function envelopeDocuments(loginAccounts, next){

    // use the |accountId| we retrieved through the Login API
    var loginAccount = new docusign.LoginAccount();
    loginAccount = loginAccounts[0];
    var accountId = loginAccount.accountId;

    // instantiate a new EnvelopesApi object
    var envelopesApi = new docusign.EnvelopesApi();

    // call the listRecipients() API
    envelopesApi.listDocuments(accountId, envelopeId, function (error, documents, response) {
      if (error) {
        console.log('Error: ' + error);
        return;
      }
      if (documents && documents.envelopeDocuments) {
        console.log('Documents: ' + JSON.stringify(documents,null,2));
        documents.envelopeDocuments.forEach(function(doc){
          downloadEnvelopeDoc(doc, loginAccounts);
        });
      }
    });

  }

]);

function downloadEnvelopeDoc(doc, loginAccounts) {
  
  // use the |accountId| we retrieved through the Login API
  var loginAccount = new docusign.LoginAccount();
  loginAccount = loginAccounts[0];
  var accountId = loginAccount.accountId;

  // instantiate a new EnvelopesApi object
  var envelopesApi = new docusign.EnvelopesApi();

  // call the listRecipients() API
  envelopesApi.getDocument(accountId, envelopeId, doc.documentId, function (error, document, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }
    if (document){
      var buffer = new Buffer(document,'binary'); // it arrives as an application/pdf in binary form
      var name = doc.name.split('.');
      if(name[name.length - 1].toLowerCase() != 'pdf'){
        name.push('pdf');
      }
      fs.writeFile(name.join('.'), buffer, function(err) {
        if( err ) {
          console.log(err);
          return;
        }
      })
    }
  });
}