CryptoJS = require("./hmac-sha256.js").CryptoJS
doEncrypt = require("./PGencode.js").doEncrypt

pgpKey = require("./keys.js").pgpKey
hmacKey = require("./keys.js").hmacKey
pgpId = require("./keys.js").pgpId
$ = require("jquery")


encodeToUTF8 = (strUni) ->
    strUtf = strUni.replace(
        /[\u0080-\u07ff]/g,
        (c) ->
            cc = c.charCodeAt(0);
            return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f);
    )

    strUtf = strUtf.replace(
        /[\u0800-\uffff]/g, 
        (c) ->
            cc = c.charCodeAt(0);
            return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f)
    )


encryptAndPost = (keyValue, iShoppingCartObject) ->
    anEncryptedKey = CryptoJS.HmacSHA256(keyValue + iShoppingCartObject.productName, hmacKey)
    if (pgpKey != null && pgpId != null) 
        aPayLoad = "#{iShoppingCartObject.governmentID},zh_CN,#{iShoppingCartObject.storeNumber}
            ,#{iShoppingCartObject.sku},#{iShoppingCartObject.quantity}
            ,#{iShoppingCartObject.firstName},#{iShoppingCartObject.lastName}
            ,#{iShoppingCartObject.emailAddress},#{iShoppingCartObject.phoneNumber}
            ,#{iShoppingCartObject.productName},#{iShoppingCartObject.planType}"
        aPayLoad = encodeToUTF8(aPayLoad)
        anEncryptedPayload = doEncrypt(pgpId, 0, pgpKey, aPayLoad)
        console.log(anEncryptedKey)
        console.log(anEncryptedPayload)
   
        $.ajax({
            type: "POST",
            data: 'key=#{anEncryptedKey}&payload=#{anEncryptedPayload}',
            url:"https://reserve-cn.appleonline.net/reservation/create",
            success:(xhr) ->
                console.log("post success")
            error: (xhr) ->
                console.log("Error occurred while communicating with the server")
            
        })

timerCount = 0


ramdomDate = ->
    year =Math.round(Math.random()*20)+1+1970

    month ="#{Math.round(Math.random()*11)+1}" 
    month = "0#{month}" if month.length is 1 
    day ="#{Math.round(Math.random()*28)+1}"
    day = "0#{day}" if day.length is 1 
    console.log "born date is #{year}#{month}#{day}"
    "#{year}#{month}#{day}"

ramdomAddr = ->
    start = 110000
    end = 659004
    addr = start+Math.round(Math.random()*50000)
    console.log "addr is #{addr}"
    "#{addr}"

ramdomRegister = ->
    num = Math.round(Math.random()*1000) # 3 num
    check = Math.round(Math.random()*10)  # 1 num
    console.log "register is #{num}#{check}"
    "#{num}#{check}"

ramdomID = ->
    
    id = "#{ramdomAddr()}#{ramdomDate()}#{ramdomRegister()}"
    console.log "id number is #{id}"
    id 

ramdomMail = ->
    num = Math.round(Math.random()*1000) # 3 num
    "superway.pan.#{num}@gmail.com"

postData = (timerID,mail,key)-> 
    if not key then keyvalue = ramdomID() else keyvalue= key
    mail = ramdomMail()  if not mail 
    iShoppingCartObject = 
        {
            "emailAddress": mail,
            "firstName" : "Li",
            "lastName" : "Sheng",
            "governmentID" : keyvalue,
            "phoneNumber": "phoneNumberundefined",
            "planType": undefined,
            "productName": "iPad",
            "quantity": "2",
            "sku": "MD531CH/A",
            "storeNumber": "R359"  #R359 nanjin road
        }
    encryptAndPost(keyvalue,iShoppingCartObject);
    timerCount++;
    if(timerCount>10000)
        clearInterval(timerID)

postMe = ->
    postData(timerID1,"superway_build@hotmail.com","360203198111073519")

postMe1 = ->
    postData(timerID2,"superway.pan@gmail.com","360203198111073519")

postRamdon = ->
    postData(timerID3)

timerID1 = setInterval(postMe, 10000)
timerID2 = setInterval(postMe1, 10000)
timerID3 = setInterval(postRamdon, 10000)

