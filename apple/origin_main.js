var CryptoJS = require("./hmac-sha256.js").CryptoJS;
var doEncrypt = require("./PGencode.js").doEncrypt;

var pgpKey = require("./keys.js").pgpKey;
var hmacKey = require("./keys.js").hmacKey;
var pgpId = require("./keys.js").pgpId;
var $ = require("jquery");

var locale1  = "zh_CN";
var serviceUrl = "https://reserve-cn.appleonline.net/reservation/create";

function encodeToUTF8(strUni) 
{
    var strUtf = strUni.replace(
        /[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
        function(c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f);
        }
    );
    strUtf = strUtf.replace(
        /[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
        function(c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
    );
    return strUtf;
} 

function encryptAndPost(keyValue, iShoppingCartObject) 
{
    var anEncryptedKey = CryptoJS.HmacSHA256(keyValue + iShoppingCartObject.productName, hmacKey);
    if (pgpKey != null && pgpId != null) 
    {
        var aPayLoad = iShoppingCartObject.governmentID + ',' + locale1 + ',' + iShoppingCartObject.storeNumber + ',' + iShoppingCartObject.sku + ',' + iShoppingCartObject.quantity + ',' + iShoppingCartObject.firstName + ',' + iShoppingCartObject.lastName + ',' + iShoppingCartObject.emailAddress + ',' + iShoppingCartObject.phoneNumber+ ',' + iShoppingCartObject.productName + ',' + iShoppingCartObject.planType;
        aPayLoad = encodeToUTF8(aPayLoad);
        var anEncryptedPayload = doEncrypt(pgpId, 0, pgpKey, aPayLoad);
        console.log(anEncryptedKey)
        console.log(anEncryptedPayload)
   
        $.ajax({
            type: "POST",
            data: 'key=' + anEncryptedKey + '&payload=' + anEncryptedPayload,
            url:serviceUrl,
            success:function(xhr) {
                console.log("success");
            },
            error:function (xhr) {
                console.log("Error occurred while communicating with the server");
            }
        });
    }

} 
var timerCount = 0;
var timerID;
function ramdomYear()
{
    var year =Math.round(Math.random()*20)+1+1970;
    var month =Math.round(Math.random()*11)+1;
    var day =Math.round(Math.random()*28)+1

}
function test()
{
    keyvalue = "360203198011211456";
    iShoppingCartObject = 
    {
        "emailAddress": "superway.pan@gmail.com",
        "firstName" : "Li",
        "lastName" : "Sheng",
        "governmentID" : "360203198011211456",
        "phoneNumber": "phoneNumberundefined",
        "planType": undefined,
        "productName": "iPad",
        "quantity": "2",
        "sku": "MD531CH/A",
        "storeNumber": "R359"  
        //R359 nanjin road
    }
    encryptAndPost(keyvalue,iShoppingCartObject);
    timerCount++;
    if(timerCount>10)
        clearInterval(timerID)

}
timerID = setInterval(test, 10000)
