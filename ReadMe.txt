Creating an SSL self-signed Certificate
---------------------------------------
1. Run below commands from the gitshell 
>openssl genrsa -out key.pem
>openssl req -new -key key.pem -out csr.pem
>openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
>rm csr.pem

TLS test for Node.js
--------------------
1. Run below command from the command prompt (location of app folder)
node -e "var https = require('https'); https.get('https://tlstest.paypal.com/', function(res){ console.log(res.statusCode) });"


MongoDB for windows 32 bit
--------------------------
1. Start the DB server
c:/program files/mongodb/server/3.2/bin>mongod.exe --storageEngine=mmapv1 --config c:/mongodb/mongo.config