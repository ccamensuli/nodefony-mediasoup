/**
 *   Firewall Config  service Security
 *
 *   // example cross domain
 *   firewalls   :{
 *      mediasoup_area:{
 *        pattern:                    /^\/mediasoup/,
 *        crossDomain:{
 *            "allow-origin":           "*",
 *            "Access-Control":{
 *              "Access-Control-Allow-Methods":         "GET, POST, PUT, DELETE, OPTIONS",
 *              "Access-Control-Allow-Headers":         "ETag, Authorization,  X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date",
 *              "Access-Control-Allow-Credentials":     true,
 *              "Access-Control-Expose-Headers":        "WWW-Authenticate ,X-Json",
 *              "Access-Control-Max-Age":               10
 *            }
 *        }
 *      }
 *    }
 **/

 const cors = {
   "allow-origin": "*",
   "Access-Control": {
     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
     "Access-Control-Allow-Headers": "nodefony_csrf, jwt, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date",
     "Access-Control-Allow-Credentials": true,
     "Access-Control-Expose-Headers": "WWW-Authenticate ,X-Json, nodefony_csrf, jwt",
     "Access-Control-Max-Age": 10
   }
 };

module.exports = {
  security:{
    firewalls   :   {
      wss_area: {
        pattern: /^\/mediasoup\/ws$/,
        crossDomain: cors
      }
    },
    encoders: {
      room: {
        algorithm: "bcrypt",
        saltRounds: 13
      }
    }
  }
};
