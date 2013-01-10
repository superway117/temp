CryptoJS = require("./hmac-sha256.js").CryptoJS
doEncrypt = require("./PGencode.js").doEncrypt

pgpKey = require("./keys.js").pgpKey
hmacKey = require("./keys.js").hmacKey
pgpId = require("./keys.js").pgpId
addrList = require("./addrList.js").addrList
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



ramdomDate = ->
    year =Math.round(Math.random()*20)+1+1970

    month ="#{Math.round(Math.random()*11)+1}" 
    month = "0#{month}" if month.length is 1 
    day ="#{Math.round(Math.random()*28)+1}"
    day = "0#{day}" if day.length is 1 
    #console.log "born date is #{year}#{month}#{day}"
    "#{year}#{month}#{day}"



ramdomAddr = ->
    line = Math.round(Math.random()*(addrList.length-1))
    #console.log("#{addrList.length} line = #{line}")
    addr = addrList[line]
    #console.log "addr is #{addr}"
    "#{addr}"

ramdomRegister = ->
    num = Math.round(Math.random()*1000) # 3 num
    #console.log "register is #{num}"
    "#{num}"

getCheck = (key17)->
    return if key17.length isnt 17
    ai = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    checkList = [1,0,"X", 9, 8 ,7 ,6 ,5, 4, 3 ,2]
    sum = 0
   
    for v,index in ai
        sum += ai[index]*(+key17[index])
    c = sum % 11
    #console.log("key17 is #{key17}; c is #{c}")

    "#{checkList[c]}" 

ramdomID = ->
    
    id17 = "#{ramdomAddr()}#{ramdomDate()}#{ramdomRegister()}"
    c = getCheck(id17)
    id = "#{id17}#{c}"
    console.log "id number is #{id}"
    id 

ramdomMail = ->
    num = Math.round(Math.random()*1000) # 3 num
    "superway.pan.#{num}@gmail.com"


encryptAndPost = (keyValue, iShoppingCartObject,succCount,failCount) ->
    anEncryptedKey = CryptoJS.HmacSHA256(keyValue + iShoppingCartObject.productName, hmacKey)
    if (pgpKey != null && pgpId != null) 
        aPayLoad = "#{iShoppingCartObject.governmentID},zh_CN,#{iShoppingCartObject.storeNumber}
,#{iShoppingCartObject.sku},#{iShoppingCartObject.quantity}
,#{iShoppingCartObject.firstName},#{iShoppingCartObject.lastName}
,#{iShoppingCartObject.emailAddress},#{iShoppingCartObject.phoneNumber}
,#{iShoppingCartObject.productName},#{iShoppingCartObject.planType}"
        console.log "aPayLoad=#{aPayLoad}"
        aPayLoad = encodeToUTF8(aPayLoad)
        anEncryptedPayload = doEncrypt(pgpId, 0, pgpKey, aPayLoad)
        
        $.ajax({
            type: "POST",
            data: 'key=#{anEncryptedKey}&payload=#{anEncryptedPayload}',
            url:"https://reserve-cn.appleonline.net/reservation/create",
            success:(xhr) ->
                console.log("Post success")
                succCount++
            error: (xhr) ->
                console.log("Error occurred")
                failCount++
            
        })
      

postData =(succCount,failCount,options) -> 
    options = {} if not options
    options.store = "R359" if not options.store
    options.sku = "MD531CH/A" if not options.sku
    options.key = ramdomID() if not options.key
    options.mail = ramdomMail() if not options.mail 
    iShoppingCartObject = 
        {
            "emailAddress": options.mail,
            "firstName" : "Eason",
            "lastName" : "eason",
            "governmentID" : options.key,
            "phoneNumber": undefined,
            "planType": undefined,
            "productName": "iPad",
            "quantity": "2",
            "sku": options.sku,    #  MD528CH/A black MD531CH/A white
            "storeNumber": options.store  #R359 nanjin road/R389 pudong
        }
    encryptAndPost(options.key,iShoppingCartObject,succCount,failCount);


postWrapper = (options)->
    count = 0
    succCount=0
    failCount=0

    
    post = ->
        postData(succCount,failCount,options)
        if count++ > 50000
            console.log("Done sent 50000")
            clearInterval(timerID)

    timerID = setInterval(post, 1000)


postWrapper()


options = 
    {
        "key": "360203198111073519",
        "mail": "superway_build@yahoo.com.cn",
        "sku": "MD528CH/A",    #  MD528CH/A black MD531CH/A white
        "storeNumber": "R389"  #R359 nanjin road/R389 pudong
    }
postWrapper(options)

###
options1 = 
    {
        "key": "360203198111073519",
        "mail": "superway_build@yahoo.com.cn",
        "sku": "MD528CH/A",    #  MD528CH/A black MD531CH/A white
        "storeNumber": "R359"  #R359 nanjin road/R389 pudong
    }
postWrapper(options1)

options2 = 
    {
        "key": "360203198111073519",
        "mail": "superway_build@yahoo.com.cn",
        "sku": "MD531CH/A",    #  MD528CH/A black MD531CH/A white
        "storeNumber": "R389"  #R359 nanjin road/R389 pudong
    }
postWrapper(options2)


options3 = 
    {
        "key": "360203198111073519",
        "mail": "superway_build@hotmail.com",
        "sku": "MD528CH/A",    #  MD528CH/A black MD531CH/A white
        "storeNumber": "R359"  #R359 nanjin road/R389 pudong
    }
postWrapper(options3)

options4 = 
    {
        "key": "360203198111073519",
        "mail": "superway_build@hotmail.com",
        "sku": "MD531CH/A",    #  MD528CH/A black MD531CH/A white
        "storeNumber": "R389"  #R359 nanjin road/R389 pudong
    }
postWrapper(options4)

###